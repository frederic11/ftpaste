import React from "react";
import { Typography, Link, Box } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        bgcolor: "background.paper",
        py: 2,
      }}
    >
      <Typography variant="body2" color="textSecondary" align="center">
        {"Made with ❤️ | Copyright © "}
        <Link color="inherit" href="https://frederictech.com/" target="_blank">
          FredericTech
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Box>
  );
};

export default Footer;
