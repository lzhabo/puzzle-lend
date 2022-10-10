import styled from "@emotion/styled";
import React from "react";
import { Column } from "@components/Flex";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import Text from "@components/Text";
import SizedBox from "@components/SizedBox";
import Card from "@src/components/Card";

interface IProps {
  onClear: () => void;
  searchValue: string;
}

const Root = styled(Column)`
  & .text {
    text-align: center;
    max-width: 225px;
    @media (min-width: 390px) {
      max-width: 335px;
    }
  }
`;

const Button = styled.button`
  font-size: 16px;
  line-height: 24px;
  color: #363870;
  background: #fff;
  border: 1px solid #f1f2fe;
  height: 40px;
  margin-top: 16px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 0 20px;
  cursor: pointer;
`;

const PoolNotFound: React.FC<IProps> = ({ onClear, searchValue }) => {
  return (
    <Card>
      <Root crossAxisSize="max" alignItems="center" justifyContent="center">
        <SizedBox height={24} />
        <NotFoundIcon style={{ marginBottom: 24 }} />
        <Text size="medium" type="secondary" className="text">
          Unfortunately, there are no pools that include {searchValue} yet.
          Reset your search and try something else.
        </Text>
        <Button onClick={onClear}>Cancel the search</Button>
        <SizedBox height={24} />
      </Root>
    </Card>
  );
};
export default PoolNotFound;
