import { PublicKey, Transaction } from '@solana/web3.js';
import { Button } from './ui/button';
import * as multisig from '@sqds/multisig';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useMultisigData } from '@/hooks/useMultisigData';
import { useQueryClient } from '@tanstack/react-query';
import { waitForConfirmation } from '../lib/transactionConfirmation';

type ApproveButtonProps = {
  multisigPda: string;
  transactionIndex: number;
  proposalStatus: string;
  programId: string;
};

const ApproveButton = ({
  multisigPda,
  transactionIndex,
  proposalStatus,
  programId,
}: ApproveButtonProps) => {
  const wallet = useWallet();
  const walletModal = useWalletModal();
  const validKinds = ['Rejected', 'Approved', 'Executing', 'Executed', 'Cancelled'];
  const isKindValid = validKinds.includes(proposalStatus || 'None');
  const { connection } = useMultisigData();
  const queryClient = useQueryClient();

  const approveProposal = async () => {
    if (!wallet.publicKey) {
      walletModal.setVisible(true);
      throw 'Wallet not connected';
    }
    
    // Debug logging
    console.log('[ApproveButton] Starting approval...');
    console.log('[ApproveButton] Connection endpoint:', connection.rpcEndpoint);
    console.log('[ApproveButton] Wallet publicKey:', wallet.publicKey.toBase58());
    console.log('[ApproveButton] MultisigPda:', multisigPda);
    console.log('[ApproveButton] TransactionIndex:', transactionIndex);
    console.log('[ApproveButton] ProposalStatus:', proposalStatus);
    console.log('[ApproveButton] ProgramId:', programId);
    
    let bigIntTransactionIndex = BigInt(transactionIndex);
    const transaction = new Transaction();
    if (proposalStatus === 'None') {
      console.log('[ApproveButton] Adding proposalCreate instruction');
      const createProposalInstruction = multisig.instructions.proposalCreate({
        multisigPda: new PublicKey(multisigPda),
        creator: wallet.publicKey,
        isDraft: false,
        transactionIndex: bigIntTransactionIndex,
        rentPayer: wallet.publicKey,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      transaction.add(createProposalInstruction);
    }
    if (proposalStatus == 'Draft') {
      console.log('[ApproveButton] Adding proposalActivate instruction');
      const activateProposalInstruction = multisig.instructions.proposalActivate({
        multisigPda: new PublicKey(multisigPda),
        member: wallet.publicKey,
        transactionIndex: bigIntTransactionIndex,
        programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
      });
      transaction.add(activateProposalInstruction);
    }
    console.log('[ApproveButton] Adding proposalApprove instruction');
    const approveProposalInstruction = multisig.instructions.proposalApprove({
      multisigPda: new PublicKey(multisigPda),
      member: wallet.publicKey,
      transactionIndex: bigIntTransactionIndex,
      programId: programId ? new PublicKey(programId) : multisig.PROGRAM_ID,
    });
    transaction.add(approveProposalInstruction);
    
    console.log('[ApproveButton] Sending transaction to:', connection.rpcEndpoint);
    try {
      // Get recent blockhash and set it on the transaction
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;
      
      console.log('[ApproveButton] Transaction blockhash:', blockhash);
      console.log('[ApproveButton] Transaction feePayer:', wallet.publicKey.toBase58());
      
      // Try to simulate the transaction first to get detailed error
      console.log('[ApproveButton] Simulating transaction...');
      try {
        const simulation = await connection.simulateTransaction(transaction);
        console.log('[ApproveButton] Simulation result:', simulation.value);
        if (simulation.value.err) {
          console.error('[ApproveButton] Simulation error:', simulation.value.err);
          console.error('[ApproveButton] Simulation logs:', simulation.value.logs);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}\nLogs: ${simulation.value.logs?.join('\n')}`);
        }
        console.log('[ApproveButton] Simulation successful, logs:', simulation.value.logs);
      } catch (simError: any) {
        console.error('[ApproveButton] Simulation threw error:', simError);
        // Continue anyway to see what wallet says
      }
      
      // Use signTransaction + sendRawTransaction instead of sendTransaction
      // This works around a Phantom wallet bug with sendTransaction
      console.log('[ApproveButton] Signing transaction with wallet...');
      const signedTransaction = await wallet.signTransaction!(transaction);
      console.log('[ApproveButton] Transaction signed, sending raw transaction...');
      
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
        preflightCommitment: 'confirmed',
      });
      console.log('[ApproveButton] Transaction signature:', signature);
      toast.loading('Confirming...', {
        id: 'transaction',
      });
      const sent = await waitForConfirmation(connection, [signature]);
      if (!sent[0]) {
        throw `Transaction failed or unable to confirm. Check ${signature}`;
      }
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error: any) {
      console.error('[ApproveButton] Transaction error:', error);
      console.error('[ApproveButton] Error name:', error?.name);
      console.error('[ApproveButton] Error message:', error?.message);
      console.error('[ApproveButton] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  };
  return (
    <Button
      disabled={isKindValid}
      onClick={() =>
        toast.promise(approveProposal, {
          id: 'transaction',
          loading: 'Loading...',
          success: 'Transaction approved.',
          error: (e) => `Failed to approve: ${e}`,
        })
      }
      className="mr-2"
    >
      Approve
    </Button>
  );
};

export default ApproveButton;
