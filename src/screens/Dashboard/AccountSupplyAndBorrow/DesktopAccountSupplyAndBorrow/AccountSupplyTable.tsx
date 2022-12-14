import styled from "@emotion/styled";
import React, { useMemo, useState, useCallback } from "react";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import { Column, Row } from "@src/components/Flex";
import { useStores } from "@stores";
import Table from "@components/Table";
import Tooltip from "@components/Tooltip";
import SquareTokenIcon from "@components/SquareTokenIcon";
import BN from "@src/utils/BN";
import Button from "@components/Button";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { ROUTES, TOKENS_LOGO_BY_ASSET_ID } from "@src/constants";
import { useTheme } from "@emotion/react";
import { TPoolStats } from "@src/stores/LendStore";
import { useSupplyAndBorrowVM } from "./SupplyAndBorrowVM";
import RoundTokenIcon from "@components/RoundTokenIcon";

interface IProps {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableWrap = styled.div<{ sort?: boolean }>`
  .sort-icon {
    width: 20px;
    height: 20px;
    margin-left: 4px;
  }

  .sort-icon-active {
    width: 20px;
    height: 20px;
    margin-left: 4px;
    transform: ${({ sort }) => (sort ? "scale(1)" : "scale(1, -1)")};
  }
`;

const SupplyApy = styled.div`
  display: flex;
  white-space: nowrap;
  justify-content: flex-end;

  img {
    margin: 1px 4px 0 -1px;
  }
`;

const SupplyApyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const TooltipText = styled(Text)`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  max-width: 180px;
  white-space: normal;
`;

const AdditionalApy = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  white-space: nowrap;

  img {
    width: 20px;
    height: 20px;
  }
`;

const AccountSupplyTable: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const [filteredSupplies, setFilteredSupplies] = useState<any[]>([]);
  const theme = useTheme();
  const vm = useSupplyAndBorrowVM();
  const navigate = useNavigate();

  const supplyColumns = useMemo(
    () => [
      { Header: "Asset", accessor: "asset" },
      { Header: "", accessor: "emptyCell" },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountSupply.length > 1
                ? vm.selectSort("selfSupply", true)
                : null
            }
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Supplied
            </Text>
            {lendStore.accountSupply.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortSupply === "selfSupply"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
            )}
          </Row>
        ),
        accessor: "supplied"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() =>
              lendStore.accountSupply.length > 1
                ? vm.selectSort("supplyAPY", true)
                : null
            }
            justifyContent="flex-end"
          >
            <Tooltip
              content={
                <Text textAlign="left">
                  Annual interest paid to investors taking into account
                  compounding.
                </Text>
              }
            >
              <Text
                style={{ textDecoration: "underline dotted" }}
                size="medium"
                fitContent
                nowrap
              >
                Supply APY
              </Text>
            </Tooltip>
            {lendStore.accountSupply.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortSupply === "supplyAPY"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
            )}
          </Row>
        ),
        accessor: "supplyApy"
      },
      {
        Header: () => (
          <Row
            style={{ cursor: "pointer" }}
            onClick={() => vm.selectSort("dailyIncome", true)}
            justifyContent="flex-end"
          >
            <Text size="medium" fitContent nowrap>
              Daily income
            </Text>
            {lendStore.accountSupply.length > 1 ? (
              <img
                src={theme.images.icons.group}
                alt="group"
                className={
                  vm.sortSupply === "dailyIncome"
                    ? "sort-icon-active"
                    : "sort-icon"
                }
              />
            ) : (
              <SizedBox width={24} />
            )}
          </Row>
        ),
        accessor: "dailyIncome"
      },
      { Header: "", accessor: "supplyBtn" },
      { Header: "", accessor: "withdrawBtn" }
    ],
    [vm, theme.images.icons.group, lendStore.accountSupply.length]
  );

  const openModal = useCallback(
    (
      e: React.MouseEvent,
      poolId: string,
      operationName: string,
      assetId: string
    ) => {
      e.stopPropagation();
      return navigate(`/${poolId}/${operationName}/${assetId}`);
    },
    [navigate]
  );
  useMemo(() => {
    const data = vm
      .sortData(lendStore.accountSupply, true)
      .map((s: TPoolStats) => ({
        onClick: () =>
          navigate(
            ROUTES.DASHBOARD_TOKEN_DETAILS.replace(
              ":poolId",
              lendStore.pool.address
            ).replace(":assetId", s.assetId)
          ),
        asset: (
          <Row alignItems="center">
            <SquareTokenIcon size="small" src={s.logo} alt="logo" />
            <SizedBox width={16} />
            <Column>
              <Text size="small" fitContent>
                {s.symbol}
              </Text>
              <Text type="secondary" size="small" fitContent>
                $ {s.prices.max.toBigFormat(2)}
              </Text>
            </Column>
          </Row>
        ),
        emptyCell: <SizedBox width={140} />,
        supplied: (
          <Column crossAxisSize="max">
            <Text weight={500} textAlign="right" size="medium">
              {BN.formatUnits(s.selfSupply, s.decimals).toBigFormat(2) +
                ` ${s.symbol}`}
            </Text>
            <Text textAlign="right" size="small" type="secondary">
              ${" "}
              {BN.formatUnits(s.selfSupply, s.decimals)
                .times(s.prices.min)
                .toBigFormat(2)}
            </Text>
          </Column>
        ),
        supplyApy: (
          <SupplyApy>
            {s.additionalSupplyAPY ? (
              <SupplyApyWrapper>
                <AdditionalApy>
                  <RoundTokenIcon
                    src={TOKENS_LOGO_BY_ASSET_ID[s.additionalSupplyAPY.assetId]}
                    alt={"logo"}
                  />
                  {s.additionalSupplyAPY.value.toBigFormat(2) + " %"}
                </AdditionalApy>
                <div style={{ textDecoration: "line-through" }}>
                  {s.supplyAPY.toBigFormat(2) + " %"}
                </div>
              </SupplyApyWrapper>
            ) : (
              <>
                <Tooltip
                  config={{ placement: "top-start" }}
                  content={
                    <TooltipText textAlign="left">
                      Non-borrowed tokens are automatically staked within native
                      protocol to generate additional interest
                    </TooltipText>
                  }
                >
                  {s.isAutostakeAvl && (
                    <img
                      src={theme.images.icons.autostaking}
                      alt="autostaking"
                      className="autostaking-icon"
                    />
                  )}
                </Tooltip>
                {s.supplyAPY.toFormat(2) + " %"}
              </>
            )}
          </SupplyApy>
        ),
        dailyIncome: (
          <Column crossAxisSize="max">
            <Text weight={500} textAlign="right" size="medium">
              {BN.formatUnits(s.dailyIncome, s.decimals).toBigFormat(6) +
                ` ${s.symbol}`}
            </Text>
            <Text textAlign="right" size="small" type="secondary">
              ${" "}
              {BN.formatUnits(s.dailyIncome, s.decimals)
                .times(s.prices.min)
                .toBigFormat(6)}
            </Text>
          </Column>
        ),
        supplyBtn: vm.isSupplyDisabled(s) ? (
          <Tooltip
            fixed
            content={
              <Text textAlign="left">Maximum total supply is reached</Text>
            }
          >
            <Button
              kind="secondary"
              size="medium"
              fixed
              disabled={true}
              onClick={(e) =>
                openModal(e, lendStore.poolId, "supply", s.assetId)
              }
              style={{ width: "100px", margin: "0 auto" }}
            >
              Supply
            </Button>
          </Tooltip>
        ) : (
          <Button
            kind="secondary"
            size="medium"
            fixed
            onClick={(e) => openModal(e, lendStore.poolId, "supply", s.assetId)}
            style={{ width: "100px", margin: "0 auto" }}
          >
            Supply
          </Button>
        ),
        withdrawBtn: (
          <Button
            kind="secondary"
            size="medium"
            fixed
            onClick={(e) =>
              openModal(e, lendStore.poolId, "withdraw", s.assetId)
            }
            style={{ width: "100px", margin: "0 auto" }}
          >
            Withdraw
          </Button>
        )
      }));
    setFilteredSupplies(data);
  }, [
    vm.sortSupply,
    vm.sortModeSupply,
    lendStore.pool.address,
    lendStore.accountSupply,
    lendStore.poolId,
    openModal,
    navigate
  ]);
  //todo fix dependency problem
  return (
    <Root>
      {lendStore.accountSupply.length > 0 && (
        <TableWrap sort={vm.sortModeSupply === "descending"}>
          <Text weight={500} type="secondary">
            My supply
          </Text>
          <SizedBox height={8} />
          <Table
            style={{ width: "100%" }}
            columns={supplyColumns}
            data={filteredSupplies}
          />
          <SizedBox height={24} />
        </TableWrap>
      )}
    </Root>
  );
};
export default observer(AccountSupplyTable);
