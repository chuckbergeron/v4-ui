import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'
import { Delegation, DelegationId } from '@pooltogether/v4-twab-delegator-js'
import { getNetworkNiceNameByChainId, prettyNumber } from '@pooltogether/utilities'
import {
  BlockExplorerLink,
  NetworkIcon,
  ButtonLink,
  TokenIcon,
  BottomSheet
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { Amount, Token } from '@pooltogether/hooks'
import { TokenBalance } from '@components/TokenBalance'
import classNames from 'classnames'
import { useAllTwabDelegations } from '@hooks/v4/TwabDelegator/useAllTwabDelegations'
import { AccountListItem } from '../AccountList/AccountListItem'
import { AccountListItemTokenBalance } from '../AccountList/AccountListItemTokenBalance'

export const TwabDelegatorItem: React.FC<{ delegator: string }> = (props) => {
  const { delegator } = props

  const { data, isFetched } = useAllTwabDelegations(delegator)
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (!isFetched || data.totalTokenWithUsdBalance.amountUnformatted.isZero()) return null

  const { delegations, totalTokenWithUsdBalance } = data

  return (
    <>
      <AccountListItem
        onClick={() => setIsOpen(true)}
        left={'🤝 ' + t('totalDelegations', 'Total amount delegated')}
        right={
          <AccountListItemTokenBalance
            chainId={delegations[0].chainId}
            token={totalTokenWithUsdBalance}
          />
        }
      />
      <DepositDelegationsSheet
        delegations={delegations}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </>
  )
}

const DepositDelegationsSheet: React.FC<{
  delegations: {
    chainId: number
    delegations: (DelegationId & Delegation)[]
    ticket: {
      address: string
      symbol: string
      name: string
      decimals: string
    }
    totalAmount: Amount
  }[]
  isOpen: boolean
  onDismiss: () => void
}> = (props) => {
  const { isOpen, onDismiss, delegations } = props

  return (
    <BottomSheet
      label='deposit-delegation-sheet'
      open={isOpen}
      onDismiss={onDismiss}
      className='flex flex-col space-y-4'
    >
      <div className='mx-auto text-2xl font-bold text-inverse'>Deposit Delegations</div>
      <p className='opacity-70 text-xs text-center mb-6'>
        Delegate your chances to win without losing custody of your deposit.
      </p>
      <ul className='space-y-4'>
        {delegations.map((data) => (
          <DelegationsList key={`delegation-list-${data.chainId}`} {...data} />
        ))}
      </ul>
      <ButtonLink
        href={`https://tools.pooltogether.com/delegate`}
        className='items-center space-x-2 mt-6'
      >
        <span>Manage delegations</span>
        <FeatherIcon icon='external-link' className='w-5 h-5' />
      </ButtonLink>
    </BottomSheet>
  )
}

const DelegationsList: React.FC<{
  chainId: number
  delegations: (DelegationId & Delegation)[]
  ticket: Token
  totalAmount: Amount
}> = (props) => {
  const { chainId, delegations, ticket } = props

  if (delegations.length === 0) return null

  return (
    <li className='bg-body p-4 rounded '>
      <div className='space-x-6 mb-2 flex'>
        <div className='space-x-2 flex items-center '>
          <NetworkIcon chainId={chainId} className='' sizeClassName='w-5 h-5' />
          <span className='capitalize leading-none tracking-wider font-bold'>
            {getNetworkNiceNameByChainId(chainId)}
          </span>
        </div>
        <div className='space-x-2 flex items-center '>
          <TokenIcon chainId={chainId} address={ticket.address} sizeClassName='w-5 h-5' />
          <span className='capitalize leading-none tracking-wider font-bold'>{ticket.symbol}</span>
        </div>
      </div>
      <DelegationHeaders />
      <ul className='space-y-1 overflow-auto max-h-44'>
        {delegations.map((delegation) => (
          <DelegationItem
            key={`delegation-${delegation.delegator}-${delegation.slot.toString()}`}
            delegation={delegation}
            ticket={ticket}
            chainId={chainId}
          />
        ))}
      </ul>
    </li>
  )
}

const DelegationHeaders = () => (
  <div className='grid grid-cols-5 mb-1'>
    <span className='col-span-1 opacity-50' />
    <span className='col-span-2 uppercase opacity-50 font-bold text-xxxs'>Address</span>
    <span className='col-span-2 uppercase opacity-50 font-bold text-xxxs'>Amount</span>
  </div>
)

const DelegationItem: React.FC<{
  chainId: number
  delegation: Delegation & DelegationId
  ticket: Token
}> = (props) => {
  const { chainId, delegation, ticket } = props
  return (
    <li className='grid grid-cols-5 items-center font-bold'>
      <span className='col-span-1 opacity-50'>{delegation.slot.toString()}</span>
      <span className='col-span-2'>
        <BlockExplorerLink address={delegation.delegatee} chainId={chainId} shorten />
      </span>
      <span className={classNames('col-span-2', { 'opacity-50': delegation.balance.isZero() })}>
        {prettyNumber(delegation.balance, ticket.decimals)}
      </span>
    </li>
  )
}
