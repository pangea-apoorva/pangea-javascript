import { FC } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import HomeIcon from "@mui/icons-material/Home";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useStoreFileViewerFolder } from "../../hooks/context";

interface Props {
  defaultHidden?: boolean;
}

const FolderOption: FC<{ folder: string; onClick: () => void }> = ({
  folder,
  onClick,
}) => {
  return (
    <Button
      variant="text"
      size="small"
      sx={{ minWidth: "fit-content" }}
      onClick={onClick}
    >
      <Typography variant="subtitle2" color="textPrimary">
        {folder}
      </Typography>
    </Button>
  );
};

const FolderPath: FC<Props> = ({ defaultHidden }) => {
  const theme = useTheme();
  const { folder, setFolder, setParentId } = useStoreFileViewerFolder();
  const folders = folder.split("/").filter((f) => !!f);

  if (!!defaultHidden && !folders.length) return null;
  return (
    <Box sx={{ paddingBottom: 1, marginLeft: -0.5 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <IconButton onClick={() => setFolder("/")}>
          <HomeIcon
            fontSize="small"
            color="inherit"
            sx={{ color: theme.palette.text.primary }}
          />
        </IconButton>
        {folders.map((f, idx) => {
          return (
            <FolderOption
              key={`folder-${idx}`}
              folder={f}
              onClick={() => {
                setFolder("/" + folders.slice(0, idx + 1).join("/"));
              }}
            />
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default FolderPath;
