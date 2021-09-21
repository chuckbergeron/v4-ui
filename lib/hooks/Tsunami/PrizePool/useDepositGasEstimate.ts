import { useUsersAddress } from '.yalc/@pooltogether/hooks/dist'
import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { sToMs } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery, UseQueryOptions } from 'react-query'

export const useDepositGasEstimate = (prizePool: PrizePool, amount: BigNumber) => {
  const usersAddress = useUsersAddress()
  const enabled =
    Boolean(prizePool) && Boolean(usersAddress) && Boolean(amount) && amount._isBigNumber
  return useQuery(
    ['useDepositGasEstimate', prizePool?.id(), usersAddress, amount?.toString()],
    async () => {
      return await prizePool.getDepositGasEstimate(usersAddress, amount)
    },
    { refetchInterval: sToMs(60), enabled } as UseQueryOptions<BigNumber>
  )
}
