import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { getFileByKey, getAllFiles, fileSystemHeader, statusBarContent } from '../data/fileContent';

// Optimized FileSystem component with React.memo for performance
const FileSystemSection = memo(({ onFileClick }) => {
    const files = getAllFiles();

    return (
        <div className="file-system">
            <div className="file-header">
                <div>{fileSystemHeader.command}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    {fileSystemHeader.status}
                </div>
            </div>
            
            {files.map((file) => (
                <div 
                    key={file.key}
                    className="file-item" 
                    onClick={() => onFileClick(file.key)}
                >
                    <div>
                        <span className={`file-name ${file.encrypted ? 'encrypted' : ''}`}>
                            {file.name}
                        </span>
                    </div>
                    <div className={`file-status ${file.encrypted ? 'encrypted' : ''}`}>
                        {file.status}
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${file.progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

FileSystemSection.displayName = 'FileSystemSection';

// Optimized Modal component with keyboard navigation and accessibility
const ModalSection = memo(({ isOpen, content, onClose }) => {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleTabKey = (event) => {
            if (!isOpen) return;
            
            // Trap focus within modal
            if (event.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements && focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (event.shiftKey) {
                        if (document.activeElement === firstElement) {
                            event.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            event.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('keydown', handleTabKey);
            
            // Focus the close button when modal opens for accessibility
            setTimeout(() => {
                closeButtonRef.current?.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('keydown', handleTabKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="modal" 
            style={{ display: 'flex' }} 
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-content" ref={modalRef}>
                <button 
                    ref={closeButtonRef}
                    className="close-btn" 
                    onClick={onClose} 
                    aria-label="Close modal"
                    type="button"
                >
                    ×
                </button>
                <div id="modalContent" style={{ marginTop: '20px' }}>
                    <pre id="modal-title">{content}</pre>
                </div>
            </div>
        </div>
    );
});

ModalSection.displayName = 'ModalSection';

// Optimized StatusBar component with efficient cursor blinking
const StatusBarSection = memo(() => {
    const [showCursor, setShowCursor] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Use requestAnimationFrame for smoother animation
        const blinkCursor = () => {
            setShowCursor(prev => !prev);
            intervalRef.current = setTimeout(blinkCursor, 750);
        };

        intervalRef.current = setTimeout(blinkCursor, 750);

        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="status-bar">
            <span>{statusBarContent.terminal}</span>
            <span>{statusBarContent.project}</span>
            <span>
                {statusBarContent.user}
                <span className={`cursor ${showCursor ? '' : 'hidden'}`}>|</span>
            </span>
        </div>
    );
});

StatusBarSection.displayName = 'StatusBarSection';

const Terminal = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Memoized callback to prevent unnecessary re-renders
    const openFile = useCallback((fileName) => {
        const fileData = getFileByKey(fileName);
        setModalContent(fileData ? fileData.content : 'File not found');
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <div className="terminal">
            <FileSystemSection onFileClick={openFile} />
            <StatusBarSection />
            <ModalSection
                isOpen={modalOpen}
                content={modalContent}
                onClose={closeModal}
            />
        </div>
    );
};

export default Terminal;