import styled from "@emotion/styled";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@src/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;

  a {
    text-decoration: none;
  }
`;

const Landing: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.TRADE);
  }, [navigate]);
  return (
    <Root>
      {/*<Home />*/}
      {/*<About />*/}
      {/*<TokensList />*/}
      {/*<Invest />*/}
      {/*<Footer />*/}
    </Root>
  );
};
export default Landing;
