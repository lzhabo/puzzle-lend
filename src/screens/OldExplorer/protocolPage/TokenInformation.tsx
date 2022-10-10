import styled from "@emotion/styled";
import Card from "@components/Card";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import React, { HTMLAttributes } from "react";
import Skeleton from "react-loading-skeleton";
import Button from "@components/Button";
import { ReactComponent as PuzzleIcon } from "@src/assets/icons/puzzle.svg";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { useOldExploreVM } from "@screens/OldExplorer/OldExploreVm";

const Root = styled(Column)`
  width: 100%;
  flex: 1;
`;

const TradePuzzleButton = styled(Button)`
  border-radius: 10px;
  color: #363870;
  width: 100%;
  min-height: 40px;
  line-height: 0;
`;

const TokenInformation = () => {
  const vm = useOldExploreVM();
  return (
    <Root>
      <Text weight={500} type="secondary" style={{ width: "fit-content" }}>
        Token information
      </Text>
      <SizedBox height={8} />
      <Card style={{ height: 320 }}>
        <Row>
          <Info
            title="Total supply"
            value={`${vm.tokenDetails.totalSupply?.toFormat(2)}` ?? "-"}
            loading={vm.tokenDetails.totalSupply == null}
          />
          <Info
            title="Circulating supply"
            value={`${vm.tokenDetails.circulatingSupply?.toFormat(2)}` ?? "-"}
            loading={vm.tokenDetails.circulatingSupply == null}
          />
        </Row>
        <SizedBox height={16} />
        <Row>
          <Info
            title="Fully diluted MC"
            value={`${vm.tokenDetails.fullyDilutedMC?.toFormat(2)}` ?? "-"}
            loading={vm.tokenDetails.fullyDilutedMC == null}
          />
          <Info
            title="Market cap"
            value={`${vm.tokenDetails.marketCap?.toFormat(2)}` ?? "-"}
            loading={vm.tokenDetails.marketCap == null}
          />
        </Row>
        <SizedBox height={16} />
        <Row>
          <Info
            title="Current price"
            value={`${vm.tokenDetails.currentPrice?.toFormat(2)}` ?? "-"}
            loading={vm.tokenDetails.currentPrice == null}
          />
          <Info
            title="24H change"
            valueColor={
              vm.tokenDetails.change24H?.gte(0) ? "#35A15A" : "#ED827E"
            }
            value={vm.tokenDetails.change24H?.toFormat(2) + " %" ?? "-"}
            loading={vm.tokenDetails.change24H == null}
          />
        </Row>
        <SizedBox height={16} />
        <Row>
          <Info
            title="24H Low"
            value={vm.low24H?.toFormat(2)}
            loading={vm.low24H == null}
          />
          <Info
            title="24H High"
            value={vm.high24H?.toFormat(2)}
            loading={vm.high24H == null}
          />
        </Row>
        <SizedBox height={16} />
        <Link
          to={`/trade?asset0=${vm.assetId}&asset1=DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p`}
        >
          <TradePuzzleButton size="medium" kind="secondary">
            <Row alignItems="center" justifyContent="center">
              Trade PUZZLE&nbsp;
              <PuzzleIcon />
            </Row>
          </TradePuzzleButton>
        </Link>
      </Card>
    </Root>
  );
};

const Info: React.FC<
  {
    title: string;
    value?: string;
    loading?: boolean;
    valueColor?: string;
  } & HTMLAttributes<HTMLDivElement>
> = ({ title, value, loading, valueColor }) => (
  <Column style={{ flex: 1 }}>
    <Text type="secondary" size="medium">
      {title}
    </Text>
    {loading ? (
      <Skeleton style={{ boxSizing: "border-box" }} height={20} width={100} />
    ) : (
      <Text
        weight={500}
        style={
          valueColor
            ? { color: valueColor, height: "20px" }
            : { height: "20px" }
        }
      >
        {value}
      </Text>
    )}
  </Column>
);

export default observer(TokenInformation);
