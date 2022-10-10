import styled from "@emotion/styled";
import React from "react";
import { useInvestToPoolInterfaceVM } from "./InvestToPoolInterfaceVM";
import rocket from "@src/assets/icons/rocket.svg";
import add from "@src/assets/icons/whiteAdd.svg";
import Img from "@components/Img";
import { Column } from "@src/components/Flex";
import Text from "@src/components/Text";
import SizedBox from "@components/SizedBox";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { useNavigate } from "react-router-dom";
import useWindowSize from "@src/hooks/useWindowSize";
import dayjs from "dayjs";
import { themes } from "@src/themes/ThemeProvider";

interface IProps {}

const Root = styled.div`
  display: flex;
  margin-top: 8px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  padding: 12px 24px;
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 16px;
  background: #1e2f5f;
  @media (min-width: 880px) {
    flex-direction: row;
  }
`;
const Block = styled.div`
  display: flex;
  width: 100%;
  padding-bottom: 16px;
  align-items: center;
  @media (min-width: 880px) {
    flex-direction: row;
    padding-bottom: 0;
  }
`;
const Boosting: React.FC<IProps> = () => {
  const vm = useInvestToPoolInterfaceVM();
  const data = vm.pool.statistics;
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const whiteText = { color: themes.lightTheme.colors.white };
  return data?.boostedApy != null ? (
    <Root>
      <Block>
        <Img width="56px" height="56px" src={rocket} />
        <SizedBox width={12} />
        <Column crossAxisSize="max">
          <Text weight={500} style={whiteText}>
            Up to {new BN(data.apy).plus(data.boostedApy ?? 0).toBigFormat(2)} %
            APY until {dayjs(data.boostedDate).format("YYYY MMM D")}
          </Text>
          <Text style={whiteText}>Hurry up to get the increased reward!</Text>
        </Column>
      </Block>
      <Button
        onClick={() => navigate(`/pools/${vm.pool.domain}/addLiquidity`)}
        size="medium"
        fixed={width != null && width <= 880}
      >
        <Img width="20px" height="20px" src={add} alt="add" />
        <SizedBox width={12} />
        Invest now
      </Button>
    </Root>
  ) : null;
};
export default Boosting;
