import styled from "@emotion/styled";
import React from "react";
import Text from "@src/components/Text";
import { TOKENS_BY_SYMBOL } from "@src/constants";
import SizedBox from "@components/SizedBox";
import { Row } from "@src/components/Flex";
import RoundTokenIcon from "@components/RoundTokenIcon";
import { useNavigate } from "react-router-dom";
import { useExploreTokenVM } from "@screens/ExploreToken/ExploreTokenVm";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;
const Tag = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  padding: 8px 16px 8px 8px;
  border-radius: 8px;
  margin: 0 8px 8px 0;
  cursor: pointer;
`;

const TradeWithTokens: React.FC<IProps> = () => {
  const navigate = useNavigate();
  const vm = useExploreTokenVM();
  const tokens = [
    TOKENS_BY_SYMBOL.USDN,
    TOKENS_BY_SYMBOL.USDT,
    TOKENS_BY_SYMBOL.WAVES,
    TOKENS_BY_SYMBOL.ETH,
    TOKENS_BY_SYMBOL.USDC,
    TOKENS_BY_SYMBOL.BNB,
  ];
  return (
    <Root>
      <SizedBox height={40} />
      <Text weight={500} size="big">
        Trade with
      </Text>
      <SizedBox height={16} />
      <Row style={{ flexWrap: "wrap" }}>
        {tokens.map((t) => (
          <Tag
            key={t.assetId}
            onClick={() =>
              navigate(`/trade?asset0=${vm.asset.assetId}&asset1=${t.assetId}`)
            }
          >
            <RoundTokenIcon src={t.logo} sizes="small" />
            <SizedBox width={8} />
            <Text>{t.symbol}</Text>
          </Tag>
        ))}
      </Row>
    </Root>
  );
};
export default TradeWithTokens;
