import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`



*:focus {
  box-shadow: none !important;
  outline: none;
}

 html {

  height: 100%;
}



body {
  background: #F1F1F1;
  -webkit-font-smoothing: antialiased;
  height: 100%;

}

div#root {
  height: 100%
}


  /* body, input, button {
    font-family:'Roboto', sans-serif;
    font-size: 16px;
  }

  h1, h2, h3, h4, h5, h6, strong {
    font-weight: 500;
  } */



  button {
    cursor: pointer;

  }
`;
