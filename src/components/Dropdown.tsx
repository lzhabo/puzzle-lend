import React, { useEffect } from "react";
import styled from "@emotion/styled";
import Text from "./Text";
import arrow from "@src/assets/icons/orderArrow.svg";
import { Row } from "./Flex";

interface IProps {
  title?: string;
  children?: string;
  isOpened?: boolean;
}

const ListGroupItem = styled.div`
  position: relative;
  padding: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => `${theme.colors.white}`};
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary100}`};
  }
`;
const Arrow = styled.img<{ isExpanded?: boolean }>`
  cursor: pointer;
  transition: transform 0.4s;
  transform: ${({ isExpanded }) =>
    isExpanded ? "rotate(-90deg)" : "rotate(90deg)"};
`;
const CollapseBlock = styled.div`
  overflow: hidden;
  transition: height 0.15s ease;

  .is-expanded & {
    margin-top: 24px;
  }
`;

const Dropdown: React.FC<IProps> = ({ title, children, isOpened = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(isOpened);
  //todo ref
  const ref = React.useRef<HTMLDivElement>(null);

  const [height, setHeight] = React.useState<number | undefined>(1);

  const handleToggle = (e: any) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);

    if (ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight);
    }
  };

  useEffect(() => {
    if (isOpened) {
      setIsExpanded(true);

      if (ref.current && ref.current.clientHeight) {
        setHeight(ref.current.clientHeight);
      }
    }
  }, [isOpened]);

  const classes = `list-group-item ${isExpanded ? "is-expanded" : null}`;
  const currentHeight = isExpanded ? height : 0;

  return (
    <ListGroupItem className={classes} onClick={handleToggle}>
      <Row alignItems="center" justifyContent="space-between">
        <Text type="primary" weight={500} fitContent>
          {title}
        </Text>
        <Arrow src={arrow} alt="arrow" isExpanded={isExpanded} />
      </Row>
      <CollapseBlock
        className="card-collapse"
        style={{ height: `${currentHeight}px` }}
      >
        <Text className="card-body" ref={ref}>
          {children}
        </Text>
      </CollapseBlock>
    </ListGroupItem>
  );
};

export default Dropdown;
