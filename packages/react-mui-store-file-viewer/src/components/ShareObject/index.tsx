import { FC, useState } from "react";
import { ObjectStore } from "../../types";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  getDateDisplayName,
  getShareDisplayIcon,
  getShareDisplayName,
} from "./utils";

import SendIcon from "@mui/icons-material/Send";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useStoreFileViewerContext } from "../../hooks/context";

import { CopyButton } from "@pangeacyber/react-mui-shared";
import SendShareViaEmailButton from "../CreateNewShareButton/SendShareViaEmailButton";

interface Props {
  object: ObjectStore.ShareObjectResponse;
  onDelete?: () => void;
}

const LinkInfo: FC<{
  object: ObjectStore.ShareObjectResponse;
}> = ({ object }) => {
  return (
    <Stack spacing={0} width="100%" sx={{ bgcolor: "#fff", padding: 1 }}>
      {!!object.expires_at && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="textSecondary">
            Expires at:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {getDateDisplayName(object.expires_at)}
          </Typography>
        </Stack>
      )}
      {object.access_count !== undefined && !!object.max_access_count && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="textSecondary">
            Remaining access count:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {object.max_access_count - (object.access_count ?? 0)}
          </Typography>
        </Stack>
      )}
      {!!object.last_accessed_at && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" color="textSecondary">
            Last accessed at:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {getDateDisplayName(object.last_accessed_at)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

const ShareObject: FC<Props> = ({ object, onDelete }) => {
  const { apiRef } = useStoreFileViewerContext();

  const [updating, setUpdating] = useState(false);

  const handleRemove = () => {
    if (!object?.id || !apiRef?.share?.delete) return;

    setUpdating(true);
    apiRef.share
      .delete({
        ids: [object.id],
      })
      .finally(() => {
        if (onDelete) onDelete();
        setUpdating(false);
      });
  };

  const LinkIcon = getShareDisplayIcon(object);
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tooltip
        title={<LinkInfo object={object} />}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: "transparent",
            },
          },
        }}
      >
        <LinkIcon color="action" />
      </Tooltip>
      <Stack spacing={0} width="100%">
        <Typography variant="body2">{getShareDisplayName(object)}</Typography>
      </Stack>
      <Stack justifySelf="end" marginLeft="auto" direction="row" spacing={-0.8}>
        {!!object.link && (
          <CopyButton
            value={object.link}
            label={getShareDisplayName(object)}
            size="small"
          />
        )}
        {!!object.id && !!object.link && (
          <SendShareViaEmailButton object={object} />
        )}
        <IconButton
          size="small"
          disabled={updating}
          data-testid={`Remove-Share-${object.id}-Btn`}
          onClick={handleRemove}
        >
          <RemoveCircleOutlineIcon color="error" fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default ShareObject;
