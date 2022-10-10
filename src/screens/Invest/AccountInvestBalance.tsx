import styled from "@emotion/styled";
import React from "react";
import bg from "@src/assets/puzzleBackground.png";
import { Column, Row } from "@src/components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
// import darkIncome from "@src/assets/icons/darkIncome.svg";
// import darkWallet from "@src/assets/icons/darkWallet.svg";
import { useInvestVM } from "@screens/Invest/InvestVm";
import Skeleton from "react-loading-skeleton";
import { observer } from "mobx-react-lite";
import { themes } from "@src/themes/ThemeProvider";

interface IProps {}

const Root = styled.div<{ pic: string }>`
  display: flex;
  flex-direction: column;
  ${({ pic }) => pic && `background: url(${pic});`};
  background-position: center;
  border-radius: 16px;
  margin-top: 24px;
  padding: 16px;
  @media (min-width: 560px) {
    padding: 24px;
  }
  row-gap: 16px;
`;
// const Icon = styled.img`
//   border-radius: 8px;
//   height: 40px;
//   width: 40px;
// `;
// const AvailableToClaim = styled(Row)`
//   border-top: 1px solid #8082c5;
//   padding-top: 18px;
//   @media (min-width: 880px) {
//     border-left: 1px solid #8082c5;
//     border-top: none;
//     padding-left: 24px;
//     padding-top: 0;
//   }
// `;
const LastClaimDate = styled(Text)`
  position: absolute;
  @media (min-width: 880px) {
    right: 24px;
  }
`;
const Details = styled.div`
  display: flex;
  flex-direction: column;

  & > :first-of-type {
    margin-bottom: 18px;
  }

  @media (min-width: 880px) {
    flex-direction: row;
    & > :first-of-type {
      margin-bottom: 0;
    }
  }
`;
const AccountInvestBalance: React.FC<IProps> = () => {
  const vm = useInvestVM();
  return (
    <Root pic={bg}>
      <Column>
        <Text type="purple300" size="medium">
          My invested balance
        </Text>
        {vm.totalInvestmentBalance != null ? (
          <Text
            weight={500}
            style={{
              fontSize: 24,
              lineHeight: "32px",
              color: themes.lightTheme.colors.white,
            }}
            // type="light"
          >
            {vm.totalInvestmentBalance}
          </Text>
        ) : (
          <Skeleton
            height={32}
            width={150}
            baseColor="#8082C5"
            highlightColor="#F1F2FE"
          />
        )}
      </Column>
      <SizedBox height={8} />
      <Details>
        <Row justifyContent="space-between" style={{ position: "relative" }}>
          <LastClaimDate
            type="secondary"
            textAlign="right"
            size="medium"
            style={{ position: "absolute" }}
          >
            {/*Last claim 1 Jan 2022*/}
            {/*{!vm.lastClaimDate.eq(0) && "Last claim " + format}*/}
          </LastClaimDate>
          {/*todo*/}
          {/*<Row>*/}
          {/*  <Icon src={darkIncome} alt="income" />*/}
          {/*  <SizedBox width={8} />*/}
          {/*  <Column>*/}
          {/*    <Text type="secondary" size="medium">*/}
          {/*      Claimed reward*/}
          {/*    </Text>*/}
          {/*    <Text weight={500} type="light">*/}
          {/*      0.00*/}
          {/*    </Text>*/}
          {/*  </Column>*/}
          {/*</Row>*/}
        </Row>
        {/*<AvailableToClaim>*/}
        {/*  <Icon src={darkWallet} alt="wallet" />*/}
        {/*  <SizedBox width={8} />*/}
        {/*  <Column>*/}
        {/*    <Text type="secondary" size="medium">*/}
        {/*      Available to claim*/}
        {/*    </Text>*/}
        {/*    <Text weight={500} type="light">*/}
        {/*      0.00*/}
        {/*    </Text>*/}
        {/*  </Column>*/}
        {/*</AvailableToClaim>*/}
      </Details>
    </Root>
  );
};
export default observer(AccountInvestBalance);
