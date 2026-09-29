import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
} from '@mui/material';
import { useState } from 'react';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    requireNote?: boolean;
    onConfirm: (note?: string) => void;
    onClose: () => void;
}

export function ConfirmationDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmColor = 'primary',
    requireNote = false,
    onConfirm,
    onClose,
}: ConfirmationDialogProps) {
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(note);
        setNote('');
    };

    const handleClose = () => {
        onClose();
        setNote('');
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText paragraph>{description}</DialogContentText>
                {requireNote && (
                    <TextField
                        autoFocus
                        margin="dense"
                        id="note"
                        label="Cancellation Reason / Note"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    {cancelLabel}
                </Button>
                <Button onClick={handleConfirm} color={confirmColor} variant="contained" disabled={requireNote && !note.trim()}>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
