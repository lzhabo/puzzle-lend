import styled from "@emotion/styled";

const ExploreLayout = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 16px;
  width: 100%;
  min-height: 100%;
  max-width: calc(1328px + 32px);
  margin-bottom: 72px;
  margin-top: 40px;
  text-align: left;

  @media (min-width: 560px) {
    margin-top: 56px;
  }

  @media (min-width: 880px) {
    margin-bottom: 96px;
  }
`;
export default ExploreLayout;
