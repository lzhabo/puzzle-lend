import styled from "@emotion/styled";
import React from "react";
import bg from "@src/assets/puzzleBackground2.png";
import customBg from "@src/assets/customPuzzleBg.png";
import puzzleIcon from "@src/assets/icons/smallWhitePuzzle.svg";
import link from "@src/assets/icons/whiteLink.svg";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import { observer } from "mobx-react-lite";
import { useInvestToPoolInterfaceVM } from "@screens/InvestToPoolInterface/InvestToPoolInterfaceVM";
import SizedBox from "@components/SizedBox";
import Button from "@components/Button";
import TransparentDetailsBtn from "@screens/InvestToPoolInterface/TransparentDetailsBtn";
import { useNavigate } from "react-router-dom";
import centerEllipsis from "@src/utils/centerEllipsis";
import TextButton from "@components/TextButton";
import { EXPLORER_URL, ROUTES } from "@src/constants";
import { useStores } from "@stores";
import SquareTokenIcon from "@components/SquareTokenIcon";
import useWindowSize from "@src/hooks/useWindowSize";
import { themes } from "@src/themes/ThemeProvider";

interface IProps {}

const Root = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
`;
const ShortInfo = styled.div<{ pic: string }>`
  display: flex;
  flex-direction: column;
  ${({ pic }) => pic && `background: url(${pic});`};
  background-position: center;
  border-radius: 16px;
  padding: 16px;
  @media (min-width: 560px) {
    padding: 24px;
  }
  row-gap: 16px;
`;
const Links = styled.div<{ isCustom?: boolean }>`
  width: 100%;
  padding-top: 32px;
  display: grid;
  column-gap: 8px;
  @media (min-width: 880px) {
    grid-template-columns: ${({ isCustom }) =>
      isCustom ? "1fr 1fr 1fr 3fr 1fr" : "1fr 1fr 4fr 1fr"};
    grid-template-rows: 1fr;
    padding-top: 44px;
  }
`;
const Hat = styled.div`
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  justify-content: space-between;
  @media (min-width: 880px) {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
`;
const Title = styled(Text)`
  font-size: 24px;
  line-height: 32px;
  font-weight: 500;
  @media (min-width: 880px) {
    font-size: 32px;
    line-height: 40px;
  }
`;
const MainPoolInfo: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const { accountStore } = useStores();
  const navigate = useNavigate();
  const handleSmartContractClick = () =>
    window.open(`${EXPLORER_URL}/address/${vm.pool.contractAddress}`);
  const completePoolInitialization = () => {
    vm.prepareCompletePoolInitialization();
    navigate(ROUTES.POOLS_CREATE);
  };
  const { width } = useWindowSize();
  const whiteText = { color: themes.lightTheme.colors.white };
  return (
    <Root>
      <ShortInfo pic={vm.pool.isCustom ? customBg : bg}>
        <Column crossAxisSize="max">
          <Hat>
            <SquareTokenIcon
              size={width != null && width < 880 ? "small" : "default"}
              src={vm.pool.logo}
              alt="pool-pic"
            />
            <SizedBox width={12} />
            <Column>
              <Title size="large" weight={500} style={whiteText}>
                {vm.pool.title}
              </Title>
              <SizedBox height={4} />
              <Text type="purple300" size="medium">
                Trade fees: {vm.pool.swapFee}%
              </Text>
            </Column>
          </Hat>
          <Links isCustom={vm.pool.isCustom}>
            <Column>
              <Text type="purple300" size="medium" nowrap>
                Creator of the pool
              </Text>
              <Text type="light" size="medium">
                {vm.pool.isCustom ? (
                  <TextButton
                    prefix={link}
                    onClick={() =>
                      window.open(`${EXPLORER_URL}/address/${vm.pool?.owner}`)
                    }
                  >
                    {centerEllipsis(vm.pool?.owner ?? "", 6)}
                  </TextButton>
                ) : (
                  <TextButton prefix={puzzleIcon}>Puzzle Swap</TextButton>
                )}
              </Text>
              <SizedBox height={16} />
            </Column>
            {vm.pool.isCustom && (
              <Column
                onClick={() =>
                  window.open(
                    `${EXPLORER_URL}/tx/${vm.pool?.artefactOriginTransactionId}`
                  )
                }
              >
                <Text type="purple300" size="medium" nowrap>
                  Created via
                </Text>
                <TextButton prefix={link}>{vm.nftPaymentName}</TextButton>
                <SizedBox height={16} />
              </Column>
            )}
            <Column>
              <Text type="purple300" size="medium">
                Smart-contract
              </Text>
              <TextButton prefix={link} onClick={handleSmartContractClick}>
                View on Explorer
              </TextButton>
            </Column>
            <SizedBox height={16} />
            <Row>
              {vm.pool.statistics == null &&
              accountStore.address === vm.pool.owner ? (
                <Button
                  fixed
                  size="medium"
                  style={{ marginRight: 8 }}
                  onClick={completePoolInitialization}
                >
                  Complete pool initialization
                </Button>
              ) : (
                <Button
                  fixed
                  size="medium"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/pools/${vm.pool.domain}`)}
                >
                  Trade
                </Button>
              )}
              {accountStore.address === vm.pool.owner && (
                <Button
                  fixed
                  size="medium"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/pools/${vm.pool.domain}/boost`)}
                >
                  Boost APY
                </Button>
              )}
              <TransparentDetailsBtn />
            </Row>
          </Links>
        </Column>
      </ShortInfo>
    </Root>
  );
};
export default observer(MainPoolInfo);
