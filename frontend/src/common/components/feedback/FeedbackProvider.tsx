import type { PropsWithChildren } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import type { AlertColor, SnackbarCloseReason } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import type { SystemStyleObject } from '@mui/system'
import { useUiStore, type ToastVariant } from '@/store/uiStore'

const toastSeverity: Record<ToastVariant, AlertColor> = {
  success: 'success',
  error: 'error',
  info: 'info',
}

const toastSxByVariant: Record<ToastVariant, SystemStyleObject<Theme>> = {
  success: {
    borderColor: 'color-mix(in srgb, var(--success) 20%, transparent)',
    bgcolor: 'var(--success-soft)',
  },
  error: {
    borderColor: 'color-mix(in srgb, var(--danger) 20%, transparent)',
    bgcolor: 'var(--danger-soft)',
  },
  info: {
    borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
    bgcolor: 'var(--primary-soft)',
  },
}

const toastBaseSx: SystemStyleObject<Theme> = {
  width: 'min(24rem, calc(100vw - 2rem))',
  border: '1px solid',
  borderRadius: '0.75rem',
  color: 'var(--text-strong)',
  boxShadow: '0 10px 30px color-mix(in srgb, var(--text-strong) 10%, transparent)',
  '& .MuiAlert-icon': {
    color: 'var(--text-base)',
  },
  '& .MuiAlert-message': {
    width: '100%',
    color: 'var(--text-base)',
  },
  '& .MuiAlertTitle-root': {
    mb: 0.25,
    color: 'var(--text-strong)',
    fontSize: '0.875rem',
    fontWeight: 700,
  },
  '& .MuiAlert-action': {
    color: 'var(--text-muted)',
  },
}

const dialogPaperSx: SystemStyleObject<Theme> = {
  width: 'min(28rem, calc(100vw - 2rem))',
  m: 2,
  border: '1px solid var(--border)',
  borderRadius: '0.75rem',
  bgcolor: 'var(--surface)',
  color: 'var(--text-base)',
  boxShadow: '0 20px 50px color-mix(in srgb, var(--text-strong) 14%, transparent)',
}

const dialogTitleSx: SystemStyleObject<Theme> = {
  px: 3,
  pt: 3,
  pb: 0,
  color: 'var(--text-strong)',
  fontSize: '1rem',
  fontWeight: 700,
}

const dialogContentSx: SystemStyleObject<Theme> = {
  px: 3,
  pt: 1.25,
  pb: 0,
}

const dialogTextSx: SystemStyleObject<Theme> = {
  color: 'var(--text-base)',
  fontSize: '0.875rem',
  lineHeight: 1.6,
}

const dialogActionsSx: SystemStyleObject<Theme> = {
  gap: 1,
  px: 3,
  pt: 3,
  pb: 3,
}

const cancelButtonSx: SystemStyleObject<Theme> = {
  borderColor: 'var(--border)',
  color: 'var(--text-base)',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    borderColor: 'var(--border)',
    bgcolor: 'var(--surface-alt)',
  },
}

const confirmButtonSx: SystemStyleObject<Theme> = {
  bgcolor: 'var(--danger)',
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  '&:hover': {
    bgcolor: 'color-mix(in srgb, var(--danger) 90%, black)',
  },
}

export function FeedbackProvider({ children }: PropsWithChildren) {
  const toasts = useUiStore((state) => state.toasts)
  const alertState = useUiStore((state) => state.alertState)
  const dismissToast = useUiStore((state) => state.dismissToast)
  const confirmAlert = useUiStore((state) => state.confirmAlert)
  const cancelAlert = useUiStore((state) => state.cancelAlert)

  const handleToastClose = (id: number, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return
    }

    dismissToast(id)
  }

  return (
    <>
      {children}

      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          autoHideDuration={toast.duration}
          onClose={(_, reason) => handleToastClose(toast.id, reason)}
          sx={{ bottom: `${1.5 + index * 5.5}rem` }}
        >
          <Alert
            severity={toastSeverity[toast.variant]}
            variant="filled"
            onClose={() => handleToastClose(toast.id)}
            sx={[toastBaseSx, toastSxByVariant[toast.variant]]}
          >
            <AlertTitle>{toast.title}</AlertTitle>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}

      <Dialog
        open={Boolean(alertState?.open)}
        onClose={cancelAlert}
        aria-labelledby="feedback-alert-title"
        aria-describedby="feedback-alert-description"
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'var(--overlay)',
            },
          },
          paper: {
            sx: dialogPaperSx,
          },
        }}
      >
        <DialogTitle id="feedback-alert-title" sx={dialogTitleSx}>
          {alertState?.title}
        </DialogTitle>
        <DialogContent sx={dialogContentSx}>
          <DialogContentText id="feedback-alert-description" sx={dialogTextSx}>
            {alertState?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button type="button" variant="outlined" onClick={cancelAlert} sx={cancelButtonSx}>
            취소
          </Button>
          <Button type="button" variant="contained" onClick={confirmAlert} sx={confirmButtonSx}>
            {alertState?.confirmText ?? '확인'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
