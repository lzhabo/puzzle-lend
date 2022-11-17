import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import Text from "@components/Text";
import { Anchor } from "@components/Anchor";
import { ReactComponent as Warn } from "@src/assets/icons/warning.svg";

type TLink = {
  href: string;
  text: string;
};

interface IProps {
  text: string;
  accentText?: React.ReactElement | string;
  link?: TLink;
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

const WarningError: React.FC<IProps> = ({ text, link, accentText }) => {
  return (
    <RowWarning>
      <Warning />
      <Column>
        <Text size="medium">{text}</Text>
        {link ? (
          <Anchor href={link.href}>
            <Text weight={500} type="error">
              {link.text}
            </Text>
          </Anchor>
        ) : (
          <Text weight={500} type="error">
            {accentText}
          </Text>
        )}
      </Column>
    </RowWarning>
  );
};

export default WarningError;
