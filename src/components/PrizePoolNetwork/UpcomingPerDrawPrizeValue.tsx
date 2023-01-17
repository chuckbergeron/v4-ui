import { CurrencyValue } from '@components/CurrencyValue'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useUpcomingPrizeTier } from '@hooks/v4/PrizePool/useUpcomingPrizeTier'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { ethers } from 'ethers'

/**
 * TODO: Actually get token prices
 * @param props
 * @returns
 */
export const UpcomingPerDrawPrizeValue = (props) => {
  const prizePool = useSelectedPrizePool()
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)
  const { data, isFetched } = useUpcomingPrizeTier(prizePool)

  return isFetched && isTokensFetched ? (
    <CurrencyValue
      value={Number(ethers.utils.formatUnits(data?.prizeTier.prize, tokens.ticket.decimals))}
    />
  ) : null
}
