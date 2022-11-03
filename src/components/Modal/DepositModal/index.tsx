import { WalletConnectionView } from '@components/ModalViews/WalletConnectionView'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSendDepositTransaction } from '@hooks/v4/PrizePool/useSendDepositTransaction'
import { Amount } from '@pooltogether/hooks'
import {
  BottomSheetWithViewState,
  ModalWithViewStateView,
  snapToFull
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { useTransaction } from '@pooltogether/wallet-connection'
import { useCallback, useState } from 'react'
import { DepositReviewView } from './DepositReviewView'
import { DepositView } from './DepositView'

export enum ViewIds {
  deposit,
  reviewTransaction,
  help,
  walletConnection
}

export const DepositModal: React.FC<{
  isOpen: boolean
  closeModal: () => void
  initialViewId?: ViewIds
}> = (props) => {
  const { isOpen, initialViewId, closeModal } = props
  const [selectedViewId, setSelectedViewId] = useState<string | number>(initialViewId)
  const [depositAmount, setDepositAmount] = useState<Amount>()
  const { chainId } = useSelectedChainId()
  const [depositTransactionId, setDepositTransactionId] = useState('')
  const depositTransaction = useTransaction(depositTransactionId)

  /**
   * Submit the transaction to deposit and store the transaction id in state
   */
  const _sendDepositTransaction = useSendDepositTransaction(depositAmount)
  const sendDepositTransaction = useCallback(
    () => setDepositTransactionId(_sendDepositTransaction()),
    [_sendDepositTransaction]
  )

  const views: ModalWithViewStateView[] = [
    {
      id: ViewIds.deposit,
      view: DepositView,
      header: 'Deposit in a Prize Pool'
    },
    {
      id: ViewIds.reviewTransaction,
      view: DepositReviewView,
      header: 'Deposit review',
      previousViewId: ViewIds.deposit,
      onCloseViewId: ViewIds.deposit
    },
    {
      id: ViewIds.walletConnection,
      view: WalletConnectionView,
      previousViewId: ViewIds.deposit,
      header: 'Connect a wallet',
      onCloseViewId: ViewIds.deposit
    }
  ]

  const onPrizePoolSelect = (prizePool: PrizePool) => {
    setSelectedViewId(ViewIds.deposit)
  }

  return (
    <BottomSheetWithViewState
      snapPoints={snapToFull}
      label='deposit-modal'
      modalHeightClassName='h-actually-full-screen min-h-1/2 xs:h-auto'
      maxHeightClassName='max-h-actually-full-screen xs:max-h-90-screen'
      maxWidthClassName='max-w-screen-xs'
      className='h-full'
      isOpen={isOpen}
      closeModal={() => {
        setDepositTransactionId('')
        closeModal()
      }}
      viewIds={ViewIds}
      views={views}
      selectedViewId={selectedViewId}
      setSelectedViewId={setSelectedViewId}
      // ExploreView
      onPrizePoolSelect={onPrizePoolSelect}
      // BridgeTokensModalView
      chainId={chainId}
      // WalletConnectionModalView
      onWalletConnected={() => setSelectedViewId(ViewIds.deposit)}
      // DepositView
      depositTransaction={depositTransaction}
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      // reviewView
      sendDepositTransaction={sendDepositTransaction}
      clearDepositTransaction={() => setDepositTransactionId('')}
      connectWallet={() => setSelectedViewId(ViewIds.walletConnection)}
    />
  )
}

DepositModal.defaultProps = {
  initialViewId: ViewIds.deposit
}