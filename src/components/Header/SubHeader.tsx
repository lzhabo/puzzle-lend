import styled from "@emotion/styled";
import React from "react";
import { Column, Row } from "@components/Flex";
import Text from "@components/Text";
import { POOLS } from "@src/constants";
import { useLocation, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";

interface IProps {}

const Root = styled(Column)`
  width: 100%;
  background: #fff;
  align-items: center;
  z-index: 101;
  max-width: 1440px;

  border-top: 1px solid ${({ theme }) => theme.colors.primary100};
  a {
    text-decoration: none;
  }
`;

const TopMenu = styled.div`
  display: flex;
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

const MenuItem = styled(Link)<{ selected?: boolean }>`
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

const isRoutesEquals = (a: string, b: string) =>
  a.replaceAll("/", "") === b.replaceAll("/", "");

const menuItems = POOLS.map((pool) => ({
  name: pool.name,
  link: pool.link
}));

const Header: React.FC<IProps> = () => {
  const location = useLocation();

  return (
    <Root>
      <TopMenu>
        <Row alignItems="center" crossAxisSize="max">
          {menuItems.map(({ name, link }) => {
            return (
              <MenuItem
                key={name}
                selected={isRoutesEquals(link, location.pathname)}
                to={link}
              >
                <Text
                  weight={500}
                  style={{
                    cursor: "pointer"
                  }}
                >
                  {name}
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
