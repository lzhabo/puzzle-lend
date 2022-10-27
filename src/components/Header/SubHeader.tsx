import styled from "@emotion/styled";
import React from "react";
import { useStores } from "@stores";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { POOLS, IPool } from "@src/constants";
import { useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  align-items: center;
  z-index: 101;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.div`
  display: flex;
  max-width: 1440px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 60px;
  z-index: 102;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.white};

  .logo {
    height: 30px;
    @media (min-width: 880px) {
      height: 36px;
    }
  }

  .icon {
    cursor: pointer;
  }
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ selected, theme }) =>
    selected ? theme.colors.primary800 : theme.colors.primary650};
  box-sizing: border-box;
  border-bottom: 4px solid
    ${({ selected, theme }) =>
      selected ? theme.colors.blue500 : "transparent"};
  height: 100%;
  margin: 0 12px;

  &:hover {
    border-bottom: 4px solid ${({ theme }) => theme.colors.primary300};
    color: ${({ theme }) => theme.colors.blue500};
  }
`;

const isRoutesEquals = (a: string, b: string, index: number) => {
  if (index === 0 && b === "/") return true;
  return a.replaceAll("/", "") === b.replaceAll("/", "");
};

const Header: React.FC<IProps> = () => {
  const { lendStore } = useStores();
  const location = useLocation();
  const navigate = useNavigate();

  //fixme replace it to app.tsx
  const changePool = (pool: IPool, index: number) => {
    lendStore.setPool(pool);
    if (index === 0) return navigate("/");

    return navigate(`/${pool.address}`);
  };

  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          {POOLS.map((pool, index) => {
            return (
              <MenuItem
                key={pool.address}
                selected={isRoutesEquals(
                  pool.address,
                  location.pathname,
                  index
                )}
                onClick={() => changePool(pool, index)}
              >
                <Text
                  weight={500}
                  style={{
                    cursor: "pointer"
                  }}
                >
                  {pool.name}
                </Text>
              </MenuItem>
            );
          })}
        </Row>
      </TopMenu>
    </Root>
  );
};

export default observer(Header);
