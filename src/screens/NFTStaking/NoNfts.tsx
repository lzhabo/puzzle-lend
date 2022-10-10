import styled from "@emotion/styled";
import React from "react";
import useWindowSize from "@src/hooks/useWindowSize";
import Button from "@components/Button";
import Text from "@components/Text";

interface IProps {
  text?: string;
  btnText?: string;
  onBtnClick?: () => void;
}

const Gradient = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  left: 0;
  height: 50px;
  width: 100%;
  position: absolute;
  margin-bottom: -1px;

  background: ${({ theme }) => theme.colors.noNftGradient};
`;
const Root = styled.div`
  position: relative;
  display: grid;

  max-height: 343px;
  @media (min-width: 880px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-height: 278px;
  }
`;

const Card = styled.div`
  border-radius: 16px;
  width: 100%;
  height: 200px;
  border: 1px solid #c6c9f4;
`;
const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  top: 40px;

  & > :first-of-type {
    margin-bottom: 16px;
  }

  @media (min-width: 880px) {
    top: 50px;
    & > :first-of-type {
      margin-bottom: 24px;
    }
  }
`;
const NoNfts: React.FC<IProps> = ({ text, btnText, onBtnClick }) => {
  const { width } = useWindowSize();
  return (
    <Root>
      {Array.from({ length: width && width > 880 ? 4 : 1 }).map((v, index) => (
        <Card key={index + "empty-card"} />
      ))}
      <Actions>
        <Text textAlign="center" style={{ whiteSpace: "break-spaces" }}>
          {text}
        </Text>
        <Button size="medium" onClick={onBtnClick}>
          {btnText}
        </Button>
      </Actions>
      <Gradient />
    </Root>
  );
};
export default NoNfts;
