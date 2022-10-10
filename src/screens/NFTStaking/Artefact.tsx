import styled from "@emotion/styled";
import React from "react";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { Column, Row } from "@src/components/Flex";
import noPic from "@src/assets/noCard.png";
import BN from "@src/utils/BN";
import Skeleton from "react-loading-skeleton";
import Button from "@components/Button";
import useElementSize from "@src/hooks/useElementSize";
import { IArtWork } from "@stores/NFTStore";

interface IProps extends IArtWork {
  buttons?: JSX.Element;
}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.white};
  padding: 8px;
  border-radius: 16px;
  justify-content: space-between;
  @media (min-width: 604px) {
    width: 100%;
    max-width: 262px;
  }
`;
const Img = styled.img`
  border: 1px solid ${({ theme }) => theme.colors.primary100};
  border-radius: 12px;
  width: 100%;
  object-fit: cover;
`;
const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;
const Buttons = styled.div`
  display: flex;
`;

const Artefact: React.FC<IProps> = ({
  name,
  apy,
  imageLink,
  marketPrice,
  buttons,
}) => {
  const boostApy = new BN(apy ?? 0);
  const price = new BN(marketPrice ?? 0);
  const [squareRef, { width }] = useElementSize();
  return (
    <Root>
      <Img ref={squareRef} style={{ height: width }} src={imageLink ?? noPic} />
      <Bottom>
        <Row mainAxisSize="stretch" justifyContent="space-between">
          <Column crossAxisSize="max">
            <Row justifyContent="space-between">
              <Text size="small">{name ?? "Name"}</Text>
              <Text type="secondary" size="small" textAlign="right">
                Floor price
              </Text>
            </Row>
            <Row justifyContent="space-between">
              <Text size="medium" weight={500}>
                {apy ? `~${boostApy.toFormat(2)}% APY` : "—"}
              </Text>
              <Text size="medium" textAlign="right">
                {marketPrice ? `~${price.toFormat()}$` : "—"}
              </Text>
            </Row>
          </Column>
        </Row>
        <SizedBox height={16} />
        <Buttons>{buttons}</Buttons>
      </Bottom>
    </Root>
  );
};

export const ArtefactSkeleton = () => {
  return (
    <Root>
      <Img src={noPic} />
      <Bottom>
        <Row mainAxisSize="stretch" justifyContent="space-between">
          <Column crossAxisSize="max">
            <Row justifyContent="space-between">
              <Skeleton height={12} width={80} />
              <Text type="secondary" size="small" textAlign="right">
                Floor price
              </Text>
            </Row>
            <Row justifyContent="space-between">
              <Skeleton height={14} width={130} />
              <Skeleton height={14} width={50} />
            </Row>
          </Column>
        </Row>
        <SizedBox height={16} />
        <Buttons>
          <Button size="medium" fixed disabled />
        </Buttons>
      </Bottom>
    </Root>
  );
};

export default Artefact;
