import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { getFileByKey, getAllFiles, fileSystemHeader, statusBarContent, headerContent } from '../data/fileContent';
import { useAnimations } from '../hooks/useAnimations';

// Optimized FileSystem component with React.memo for performance
const FileSystemSection = memo(({ onFileClick }) => {
    const files = getAllFiles();

    const handleFileClick = useCallback((fileKey, isEncrypted) => {
        if (isEncrypted) {
            // Add glitch effect for encrypted files
            const fileElement = document.querySelector(`[data-file-key="${fileKey}"]`);
            if (fileElement) {
                fileElement.classList.add('glitch');
                setTimeout(() => {
                    fileElement.classList.remove('glitch');
                }, 600);
            }
        }
        onFileClick(fileKey);
    }, [onFileClick]);

    return (
        <div className="file-system file-system--dark">
            <div className="file-header file-system__header--dark">
                <div>{fileSystemHeader.command}</div>
                <div className="file-system__status">
                    {fileSystemHeader.status}
                </div>
            </div>
            
            {files.map((file) => (
                <div 
                    key={file.key}
                    data-file-key={file.key}
                    className={`file-item file-item--dark ${file.encrypted ? 'file-item--encrypted' : ''}`}
                    onClick={() => handleFileClick(file.key, file.encrypted)}
                >
                    <div>
                        <span className={`file-name file-item__name--dark ${file.encrypted ? 'file-item__name--encrypted-dark' : ''}`}>
                            {file.name}
                        </span>
                    </div>
                    <div className={`file-status file-item__status--dark ${file.encrypted ? 'file-item__status--encrypted-dark' : ''}`}>
                        {file.status}
                        <div className={`progress-bar progress-bar--dark ${file.encrypted ? 'progress-bar--encrypted' : ''}`}>
                            <div 
                                className={`progress-fill progress-bar__fill--dark ${file.progress > 0 ? 'animate-shine' : ''}`}
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

// Header component with logo and subtitle animations
const HeaderSection = memo(() => {
    return (
        <div className="header header--animated">
            <div className="logo animate-glow">
                {headerContent.logo}
            </div>
            <div className="subtitle animate-typewriter">
                {headerContent.subtitle}
            </div>
        </div>
    );
});

HeaderSection.displayName = 'HeaderSection';

// Morphing display component with animation sequences
const MorphingDisplay = memo(() => {
    const {
        currentSequence,
        startMorphing,
        stopMorphing,
        getCurrentFrameContent,
        availableSequences,
        performanceMetrics,
        isAnimating
    } = useAnimations();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayContent, setDisplayContent] = useState('');
    const transitionTimeoutRef = useRef(null);

    // Handle smooth transitions between frames
    const handleContentTransition = useCallback((newContent) => {
        if (newContent !== displayContent) {
            setIsTransitioning(true);
            
            // Clear existing timeout
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
            
            // Transition timing for smooth morphing effect
            transitionTimeoutRef.current = setTimeout(() => {
                setDisplayContent(newContent);
                
                // End transition after content update
                setTimeout(() => {
                    setIsTransitioning(false);
                }, 150); // Half of the transition duration
            }, 150);
        }
    }, [displayContent]);

    // Start morphing animation on component mount
    useEffect(() => {
        startMorphing('identity', 2000); // Start with identity sequence, 2 second intervals
        
        // Set up sequence switching logic with performance optimization
        const sequenceSwitchInterval = setInterval(() => {
            // Only switch if performance is good (FPS > 30)
            if (performanceMetrics.fps > 30 || performanceMetrics.fps === 0) {
                // Randomly switch sequences for variety
                if (Math.random() < 0.3) { // 30% chance to switch
                    const sequences = availableSequences.filter(seq => seq !== currentSequence);
                    const randomSequence = sequences[Math.floor(Math.random() * sequences.length)];
                    startMorphing(randomSequence, 2000);
                }
            }
        }, 8000); // Check every 8 seconds

        return () => {
            clearInterval(sequenceSwitchInterval);
            stopMorphing();
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, [startMorphing, stopMorphing, availableSequences, currentSequence, performanceMetrics.fps]);

    // Update display content with smooth transitions
    useEffect(() => {
        const currentContent = getCurrentFrameContent();
        if (currentContent) {
            handleContentTransition(currentContent);
        }
    }, [getCurrentFrameContent, handleContentTransition]);

    // Initialize display content
    useEffect(() => {
        if (!displayContent) {
            const initialContent = getCurrentFrameContent();
            if (initialContent) {
                setDisplayContent(initialContent);
            }
        }
    }, [displayContent, getCurrentFrameContent]);

    return (
        <div className="morphing-container">
            {/* Orbital animation rings - responsive design */}
            <div 
                className="morphing-container__orbit morphing-container__orbit--outer"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px',
                    border: '2px solid rgba(255, 107, 53, 0.2)',
                    borderRadius: '50%',
                    animation: 'orbit 15s linear infinite reverse',
                    pointerEvents: 'none'
                }}
            />
            <div 
                className="morphing-container__orbit morphing-container__orbit--inner"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    border: '1px solid rgba(255, 179, 71, 0.3)',
                    borderRadius: '50%',
                    animation: 'orbit 10s linear infinite',
                    pointerEvents: 'none'
                }}
            />
            
            {/* Main morphing display with smooth transitions */}
            <div 
                className={`morph-display ${isTransitioning ? 'animate-morph' : ''}`}
                style={{
                    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                    opacity: isTransitioning ? 0.7 : 1,
                    transform: isTransitioning ? 'scale(0.98)' : 'scale(1)'
                }}
            >
                <pre>{displayContent}</pre>
            </div>
            
            {/* Animation controls for development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="morphing-controls" style={{ 
                    position: 'absolute', 
                    bottom: '-60px', 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '10px',
                    fontSize: '12px'
                }}>
                    <button 
                        onClick={() => startMorphing('identity', 1500)}
                        style={{ 
                            padding: '4px 8px', 
                            background: currentSequence === 'identity' ? '#ff6b35' : 'rgba(255,107,53,0.3)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Identity
                    </button>
                    <button 
                        onClick={() => startMorphing('loading', 1000)}
                        style={{ 
                            padding: '4px 8px', 
                            background: currentSequence === 'loading' ? '#ff6b35' : 'rgba(255,107,53,0.3)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Loading
                    </button>
                    <button 
                        onClick={() => startMorphing('concepts', 2000)}
                        style={{ 
                            padding: '4px 8px', 
                            background: currentSequence === 'concepts' ? '#ff6b35' : 'rgba(255,107,53,0.3)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Concepts
                    </button>
                    <button 
                        onClick={isAnimating ? stopMorphing : () => startMorphing(currentSequence, 2000)}
                        style={{ 
                            padding: '4px 8px', 
                            background: isAnimating ? '#ff3b30' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isAnimating ? 'Pause' : 'Play'}
                    </button>
                </div>
            )}
            
            {/* Performance metrics for development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="performance-debug" style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    fontSize: '10px', 
                    color: '#666',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '8px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    lineHeight: '1.2'
                }}>
                    <div>FPS: {performanceMetrics.fps}</div>
                    <div>Sequence: {currentSequence}</div>
                    <div>Frame: {performanceMetrics.totalFrames}</div>
                    <div>Dropped: {performanceMetrics.droppedFrames}</div>
                    <div>Status: {isAnimating ? 'Running' : 'Paused'}</div>
                </div>
            )}
        </div>
    );
});

MorphingDisplay.displayName = 'MorphingDisplay';

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
            <HeaderSection />
            <MorphingDisplay />
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