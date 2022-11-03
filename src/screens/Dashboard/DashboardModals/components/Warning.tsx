import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";
import { ReactComponent as Warn } from "@src/assets/icons/warning.svg";

interface IProps {
  text: string;
}

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

const WarningError: React.FC<IProps> = ({ text }) => {
  return (
    <RowWarning>
      <Warning />
      <Column>
        <Text size="medium">{text}</Text>
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
