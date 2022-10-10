import React from "react";
import { IToken } from "@src/constants";
import { Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import Text from "@components/Text";
import { Link } from "react-router-dom";
import Button from "@components/Button";

interface IProps {
  v: IToken & { poolId: string; balance: string };
}

const TableRow: React.FC<IProps> = ({ v }) => {
  return (
    <tr key={v.assetId}>
      <td>
        <Row alignItems="center">
          <img
            style={{ width: 24, height: 24, borderRadius: "50%" }}
            src={v.logo}
            alt={v.name}
          />
          <SizedBox width={8} />
          <Text className="tableText">{v.symbol}</Text>
        </Row>
      </td>
      <td>
        <Text className="tableText" style={{ whiteSpace: "nowrap" }}>
          $ {v.balance}
        </Text>
      </td>
      <td>
        <Link to="/trade">
          <Button
            className="tableText"
            style={{ height: 40, padding: "0px 4px", width: "100%" }}
            kind="secondary"
          >
            Trade
          </Button>
        </Link>
      </td>
    </tr>
  );
};

export default TableRow;
