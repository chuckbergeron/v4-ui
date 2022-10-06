import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useLatestDrawWinners } from '@hooks/v4/useDrawWinners'
import { useLatestDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import { LinkIcon, Modal, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { loopXTimes } from '@utils/loopXTimes'
import classNames from 'classnames'
import Link from 'next/link'
import { useEffect } from 'react'

export const PastDrawsModal = (props: {
  isOpen: boolean
  closeModal: () => void
  prizeDistributor: PrizeDistributor
}) => {
  const { isOpen, closeModal, prizeDistributor } = props
  const { data: winners, isError, isFetched } = useLatestDrawWinners(prizeDistributor, true)
  const { data: winnersInfo } = useLatestDrawWinnersInfo(prizeDistributor)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)

  useEffect(() => {
    console.log(winners?.prizes)
  }, [winners?.prizes])

  return (
    <Modal label={'Past draws modal'} isOpen={isOpen} closeModal={closeModal}>
      {/* Title */}
      <div className='text-2xl font-bold flex space-x-2 mb-4'>
        <span>Draw #</span>
        <LatestDrawId prizeDistributor={prizeDistributor} />{' '}
      </div>
      <div className='mb-8'>
        Draw #
        <LatestDrawId prizeDistributor={prizeDistributor} /> on{' '}
        {getNetworkNiceNameByChainId(prizeDistributor.chainId)} had{' '}
        <b>{winnersInfo?.prizesWon} prizes</b> totalling{' '}
        <b className='animate-rainbow'>{winnersInfo?.amount.amountPretty}</b>{' '}
        {tokenData?.token.symbol}
      </div>

      {/* Table Header */}
      <div className='grid grid-cols-2 text-center text-opacity-80 mb-3'>
        <span>Pooler</span>
        <span>Prize</span>
      </div>

      {/* Error message */}
      {!!isError && (
        <div className='text-pt-red-light py-8 text-center w-full'>
          An error occurred fetching winners for draw #
          <LatestDrawId prizeDistributor={prizeDistributor} />
        </div>
      )}

      {/* No winners message */}
      {isFetched && winners?.prizes.length === 0 && (
        <div className='text-opacity-80 w-full text-center py-8'>No winners 😔</div>
      )}

      {/* Table content */}
      <ul className='space-y-2'>
        {!isFetched && (
          <>
            {loopXTimes(5, (i) => (
              <li
                key={`loading-list-${i}`}
                className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
              />
            ))}
          </>
        )}
        {winners?.prizes.map(({ address, amount, pick, tier }) => (
          <li
            key={`${prizeDistributor.id()}-${address}-${pick}`}
            className='grid grid-cols-2 text-center'
          >
            <Link href={`/account/${address}`}>
              <a className='hover:text-pt-teal'>
                {shorten({ hash: address })}
                <LinkIcon className='w-4 h-4' />
              </a>
            </Link>
            <div className='flex space-x-1 items-center mx-auto'>
              <TokenIcon
                chainId={prizeDistributor.chainId}
                address={tokenData?.token.address}
                sizeClassName='w-4 h-4'
              />
              <b className={classNames({ 'animate-rainbow': tier === 0 })}>{amount.amountPretty}</b>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
