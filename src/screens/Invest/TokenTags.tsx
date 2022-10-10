import styled from "@emotion/styled";
import React from "react";
import Tag from "@components/Tag";
import Text from "@components/Text";
import { IAssetBalance } from "@src/entities/Balance";
import { IToken } from "@src/constants";
import { Row } from "@components/Flex";
import { useTheme } from "@emotion/react";

interface IProps {
  tokens: ({ share: number } & IToken)[];
  findBalanceByAssetId: (assetId: string) => IAssetBalance | null | undefined;
}

const Root = styled(Row)`
  padding-top: 8px;
  flex-wrap: wrap;
  margin: -2px;

  & > * {
    margin: 2px;
  }
`;
const TokenTags: React.FC<IProps> = ({ tokens, findBalanceByAssetId }) => {
  const needToHide = tokens.length > 3;
  const tokensToDisplay = needToHide ? tokens.slice(0, 3) : tokens;
  const moreHiddenAmount = tokens.length - 3;
  const theme = useTheme();
  return (
    <Root>
      {tokensToDisplay.map(({ symbol, assetId, share }, i) => {
        const assetBalance = findBalanceByAssetId(assetId);
        const isActive =
          assetBalance && assetBalance.balance && assetBalance.balance.gt(0);
        return (
          <Tag
            key={assetId + String(i)}
            background={isActive ? theme.colors.primary300 : undefined}
          >
            {symbol} {share} %
          </Tag>
        );
      })}
      {needToHide && moreHiddenAmount > 0 && (
        <Text type="blue500" weight={500} fitContent>
          +{moreHiddenAmount} more
        </Text>
      )}
    </Root>
  );
};
export default TokenTags;
