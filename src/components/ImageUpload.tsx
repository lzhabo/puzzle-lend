import styled from "@emotion/styled";
import React from "react";
import { compressImage, getB64FileLength, toBase64 } from "@src/utils/files";
import { useStores } from "@stores";
import plus from "@src/assets/icons/plus.svg";
import Text from "@components/Text";
import { Column, Row } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { ReactComponent as Cross } from "@src/assets/icons/darkClose.svg";

interface IProps {
  fileName: string | null;
  onFileNameChange: (v: string | null) => void;

  fileSize: string | null;
  onFileSizeChange: (v: string | null) => void;

  image: string | null;
  onChange: (image?: string) => void;
}

const Root = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;

  .upload-btn-wrapper {
    position: relative;
  }

  .btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: black;
  }

  .upload-btn-wrapper input[type="file"] {
    cursor: pointer;
    width: 56px;
    height: 56px;
    position: absolute;
    opacity: 0;
    bottom: 0;
  }
`;

const Container = styled.div<{ image: string | null }>`
  border: 1px solid #f1f2fe;
  ${({ image }) =>
    image != null
      ? `background-image: url(${image});`
      : `background: #C6C9F4;`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  box-sizing: border-box;
  box-shadow: none;
  color: transparent;
  width: 56px;
  height: 56px;
  position: relative;
  flex-shrink: 0;
`;

const CloseButton = styled(Cross)`
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  height: 20px;
  width: 20px;
`;

const ImageUpload: React.FC<IProps> = ({
  onChange,
  image,
  fileName,
  onFileNameChange,
  fileSize,
  onFileSizeChange,
}) => {
  const { notificationStore } = useStores();
  const handleChange = async (v: React.ChangeEvent<HTMLInputElement>) => {
    const files = v.target.files;
    if (!files || !files[0]) return;
    const file: File = files[0];
    if (!/(gif|jpe?g|png|bmp|svg\+xml)$/i.test(file.type)) {
      notificationStore.notify("Please choose other file extension");
    }
    try {
      const b64 = await toBase64(file);
      onFileNameChange(files[0].name.toString());
      const compressed = await compressImage(b64);
      onChange(compressed);
      onFileSizeChange(getB64FileLength(compressed));
    } catch (e: any) {}
  };

  return (
    <Root>
      <Container className="upload-btn-wrapper" image={image}>
        {image == null && (
          <img
            src={plus}
            style={{ top: 16, right: 16, position: "absolute" }}
            alt="plus"
          />
        )}
        <div className="btn">
          <input
            style={{ zIndex: 2 }}
            accept="image/*"
            type="file"
            name="file"
            onChange={handleChange}
          />
        </div>
      </Container>
      <SizedBox width={8} />
      {image == null ? (
        <Column>
          <Text weight={500}>Upload the image for the pool</Text>
          <Text size="small" type="secondary">
            JPG or PNG file, up to 1 MB
          </Text>
        </Column>
      ) : (
        <Column>
          <Row alignItems="center">
            <Text fitContent weight={500}>
              {fileName}
            </Text>
            <CloseButton onClick={() => onChange(undefined)} />
          </Row>
          <Text size="small" type="secondary">
            {fileSize} KB
          </Text>
        </Column>
      )}
    </Root>
  );
};
export default ImageUpload;
