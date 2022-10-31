import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";
import { ReactComponent as Warn } from "@src/assets/icons/warning.svg";

interface IProps {}

const Warning = styled(Warn)`
  min-width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const RowWarning = styled.div`
  display: flex;
  border-radius: 16px;
  padding: 12px 28px;
  background-color: ${({ theme }) => theme.colors.error100};
`;

const WarningError: React.FC<IProps> = () => {
  return (
    <RowWarning>
      <Warning />
      <Column>
        <Text size="medium">
          In case of market insolvency borrow limit of assets may decrease which
          may cause liquidation of your assets
        </Text>
        <Anchor href="https://puzzle-lend.gitbook.io/guidebook/suppliers-guide/safety-features">
          <Text weight={500} type="error">
            Learn more
          </Text>
        </Anchor>
      </Column>
    </RowWarning>
  );
};

export default WarningError;
