import styled from 'styled-components'
import { Text, Flex, useModal, CalculateIcon, SkeletonV2, FlexProps, Button } from '@pancakeswap/uikit'
import RoiCalculatorModal from 'components/RoiCalculatorModal'
import { BalanceWithLoading } from 'components/Balance'
import { DeserializedPool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { vaultPoolConfig } from 'config/constants/pools'
import { useCurrentBlock } from 'state/block/hooks'
import { getPoolBlockInfo } from 'views/Pools/helpers'

const AprLabelContainer = styled(Flex)`
  &:hover {
    opacity: 0.5;
  }
`

interface AprProps extends FlexProps {
  pool: DeserializedPool
  stakedBalance: BigNumber
  showIcon: boolean
  performanceFee?: number
}

const Apr: React.FC<AprProps> = ({ pool, showIcon, stakedBalance, performanceFee = 0, ...props }) => {
  const {
    stakingToken,
    earningToken,
    isFinished,
    earningTokenPrice,
    stakingTokenPrice,
    userData,
    apr,
    rawApr,
    vaultKey,
  } = pool
  const { t } = useTranslation()
  const currentBlock = useCurrentBlock()

  const { shouldShowBlockCountdown, hasPoolStarted } = getPoolBlockInfo(pool, currentBlock)

  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO

  const apyModalLink = stakingToken.address ? `/swap?outputCurrency=${stakingToken.address}` : '/swap'

  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      earningTokenPrice={earningTokenPrice}
      stakingTokenPrice={stakingTokenPrice}
      stakingTokenBalance={stakedBalance.plus(stakingTokenBalance)}
      apr={vaultKey ? rawApr : apr}
      stakingTokenSymbol={stakingToken.symbol}
      linkLabel={t('Get %symbol%', { symbol: stakingToken.symbol })}
      linkHref={apyModalLink}
      earningTokenSymbol={earningToken.symbol}
      autoCompoundFrequency={vaultPoolConfig[vaultKey]?.autoCompoundFrequency ?? 0}
      performanceFee={performanceFee}
    />,
  )

  const openRoiModal = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onPresentApyModal()
  }

  const isValidate = apr !== undefined && !Number.isNaN(apr)

  return (
    <AprLabelContainer alignItems="center" justifyContent="flex-start" {...props}>
      <SkeletonV2 width="80px" height="16px" isDataReady={isValidate || isFinished}>
        {hasPoolStarted || !shouldShowBlockCountdown ? (
          <>
            <BalanceWithLoading
              onClick={openRoiModal}
              fontSize="16px"
              isDisabled={isFinished}
              value={isFinished ? 0 : apr}
              decimals={2}
              unit="%"
            />
            {!isFinished && showIcon && (
              <Button onClick={openRoiModal} variant="text" width="20px" height="20px" padding="0px" marginLeft="4px">
                <CalculateIcon color="textSubtle" width="20px" />
              </Button>
            )}
          </>
        ) : (
          <Text>-</Text>
        )}
      </SkeletonV2>
    </AprLabelContainer>
  )
}

export default Apr
