import React, { createRef, useState } from "react";
import useOnClickOutside from "@src/hooks/useOnClickOutside";
import Dialog from "@components/Dialog";
import Scrollbar from "@src/components/Scrollbar";
import { Column } from "@src/components/Flex";
import SizedBox from "@components/SizedBox";
import { observer } from "mobx-react-lite";
import Text from "@components/Text";
import Balance from "@src/entities/Balance";
import Input from "@components/Input";
import ButtonsGroup from "@components/ButtonsGroup";
import styled from "@emotion/styled";
import TokenInfo from "./TokenInfo";

interface IProps {
  onClose: () => void;
  balances: Balance[];
  onSelect: (assetId: string) => void;
  visible: boolean;
  selectedTokenId?: string;
}

const tokenCategories = [
  "All",
  "Global",
  "Stablecoins",
  "Waves DeFi",
  "Waves Ducks",
];

export enum tokenCategoriesEnum {
  all = 0,
  global = 1,
  stable = 2,
  defi = 3,
  ducks = 4,
}

const Scroll = styled.div`
  display: flex;
  margin: 0 -24px;
  padding: 0 24px 16px 24px;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;

  ::-webkit-scrollbar {
    display: none;
  }

  border-bottom: 1px solid ${({ theme }) => theme.colors.primary100};
`;
const TokenSelectModal: React.FC<IProps> = ({
  onClose,
  balances,
  onSelect,
  visible,
  selectedTokenId,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const handleSearch = (event: any) => {
    setSearchValue(event.target.value);
  };
  const ref = createRef<HTMLDivElement>();
  useOnClickOutside(ref, onClose);

  const handleTokenSelect = (assetId: string) => {
    onSelect(assetId);
    setActiveFilter(0);
    onClose();
  };
  const filteredTokens = balances
    .filter((v) => {
      if (!v || !v.symbol || !v.name) {
        return false;
      }
      return (
        v.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
        v.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    })
    .filter((balance) => {
      if (activeFilter === 0) return true;
      return balance.category?.includes(tokenCategoriesEnum[activeFilter]);
    });

  return (
    <Dialog
      visible={visible}
      style={{ maxWidth: 360 }}
      bodyStyle={{ minHeight: 440 }}
      onClose={() => {
        setActiveFilter(0);
        onClose();
      }}
      title="Select a token"
    >
      <Input
        icon="search"
        value={searchValue}
        onChange={handleSearch}
        placeholder="Search by name or ticker…"
      />
      <SizedBox height={16} />

      <Scroll>
        <ButtonsGroup
          values={tokenCategories}
          active={activeFilter}
          onClick={(v) => setActiveFilter(v)}
        />
      </Scroll>
      <SizedBox height={32} />
      <Scrollbar style={{ margin: -24 }}>
        <Column crossAxisSize="max" style={{ maxHeight: 352 }}>
          {filteredTokens && filteredTokens.length > 0 ? (
            filteredTokens.map((t) => {
              const disabled = selectedTokenId === t.assetId;
              return (
                <TokenInfo
                  hidden={disabled}
                  style={{ position: "relative" }}
                  withClickLogic
                  onClick={
                    !disabled ? () => handleTokenSelect(t.assetId) : () => null
                  }
                  key={t.assetId}
                  token={t}
                />
              );
            })
          ) : (
            <Text style={{ padding: "10px 24px" }}>No tokens found</Text>
          )}
          <SizedBox height={32} width={16} />
        </Column>
      </Scrollbar>
    </Dialog>
  );
};
export default observer(TokenSelectModal);
