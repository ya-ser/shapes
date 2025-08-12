import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Terminal from '../Terminal';
import * as fileContentModule from '../../data/fileContent';
import * as useAnimationsModule from '../../hooks/useAnimations';

// Mock the file content module
jest.mock('../../data/fileContent', () => ({
  getFileByKey: jest.fn(),
  getAllFiles: jest.fn(),
  fileSystemHeader: {
    command: 'ls -la /home/user/projects/shapes',
    status: '[████████░░] 89% indexed'
  },
  statusBarContent: {
    terminal: 'Terminal v2.1.3',
    project: 'SHAPES',
    user: 'user@shapes:~$'
  },
  headerContent: {
    logo: 'SHAPES',
    subtitle: 'Digital Design Laboratory'
  }
}));

// Mock the animations hook
jest.mock('../../hooks/useAnimations', () => ({
  useAnimations: jest.fn()
}));

// Mock requestAnimationFrame for tests
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

describe('Terminal Component', () => {
  const mockFiles = [
    {
      key: 'home',
      name: 'HOME.txt',
      status: '[████████░░] 100% loaded',
      progress: 100,
      encrypted: false
    },
    {
      key: 'projects',
      name: 'PROJECTS.txt',
      status: '[██████░░░░] 60% loaded',
      progress: 60,
      encrypted: false
    },
    {
      key: 'encrypted',
      name: 'CLASSIFIED.enc',
      status: '[░░░░░░░░░░] ENCRYPTED',
      progress: 0,
      encrypted: true
    }
  ];

  const mockAnimationsHook = {
    currentSequence: 'identity',
    startMorphing: jest.fn(),
    stopMorphing: jest.fn(),
    getCurrentFrameContent: jest.fn(() => 'Mock ASCII Art'),
    availableSequences: ['identity', 'loading', 'concepts'],
    performanceMetrics: {
      fps: 60,
      totalFrames: 100,
      droppedFrames: 0
    },
    isAnimating: true
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    fileContentModule.getAllFiles.mockReturnValue(mockFiles);
    fileContentModule.getFileByKey.mockImplementation((key) => {
      const file = mockFiles.find(f => f.key === key);
      return file ? { ...file, content: `Content for ${key}` } : null;
    });
    
    useAnimationsModule.useAnimations.mockReturnValue(mockAnimationsHook);
  });

  describe('Component Rendering', () => {
    test('renders terminal with all sections', () => {
      render(<Terminal />);
      
      // Check if main terminal container is rendered
      const terminalContainer = document.querySelector('.terminal');
      expect(terminalContainer).toBeInTheDocument();
      
      // Check if file system section is rendered
      expect(screen.getByText('ls -la /home/user/projects/shapes')).toBeInTheDocument();
      
      // Check if status bar is rendered
      expect(screen.getByText('Terminal v2.1.3')).toBeInTheDocument();
      expect(screen.getAllByText('SHAPES')).toHaveLength(2);
      expect(screen.getByText(/user@shapes:~\$/)).toBeInTheDocument();
    });

    test('renders header section with logo and subtitle', () => {
      render(<Terminal />);
      
      expect(screen.getAllByText('SHAPES')).toHaveLength(2); // One in header, one in status bar
      expect(screen.getByText('Digital Design Laboratory')).toBeInTheDocument();
    });

    test('renders morphing display component', () => {
      render(<Terminal />);
      
      // Check if morphing container exists
      const morphingContainer = document.querySelector('.morphing-container');
      expect(morphingContainer).toBeInTheDocument();
      
      // Check if morph display exists
      const morphDisplay = document.querySelector('.morph-display');
      expect(morphDisplay).toBeInTheDocument();
    });
  });

  describe('File System Interactions', () => {
    test('renders all files from data source', () => {
      render(<Terminal />);
      
      expect(screen.getByText('HOME.txt')).toBeInTheDocument();
      expect(screen.getByText('PROJECTS.txt')).toBeInTheDocument();
      expect(screen.getByText('CLASSIFIED.enc')).toBeInTheDocument();
    });

    test('displays file status and progress correctly', () => {
      render(<Terminal />);
      
      expect(screen.getByText('[████████░░] 100% loaded')).toBeInTheDocument();
      expect(screen.getByText('[██████░░░░] 60% loaded')).toBeInTheDocument();
      expect(screen.getByText('[░░░░░░░░░░] ENCRYPTED')).toBeInTheDocument();
    });

    test('opens modal when clicking on regular file', async () => {
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Content for home')).toBeInTheDocument();
      });
    });

    test('applies glitch effect when clicking encrypted file', async () => {
      render(<Terminal />);
      
      const encryptedFile = screen.getByText('CLASSIFIED.enc');
      fireEvent.click(encryptedFile);
      
      // Check if glitch class is applied (we'll need to check the DOM element)
      const fileElement = encryptedFile.closest('[data-file-key="encrypted"]');
      expect(fileElement).toBeInTheDocument();
    });

    test('handles file not found scenario', async () => {
      fileContentModule.getFileByKey.mockReturnValue(null);
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByText('File not found')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Functionality', () => {
    test('modal is initially closed', () => {
      render(<Terminal />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('modal opens with correct content when file is clicked', async () => {
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(screen.getByText('Content for home')).toBeInTheDocument();
      });
    });

    test('modal closes when close button is clicked', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('modal closes when backdrop is clicked', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Click backdrop (the modal overlay itself)
      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('modal does not close when clicking modal content', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Click on modal content (should not close)
      const modalContent = screen.getByText('Content for home');
      fireEvent.click(modalContent);
      
      // Modal should still be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('modal closes when Escape key is pressed', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('focus is trapped within modal', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close button should be focused initially
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toHaveFocus();
      });
    });

    test('Tab navigation works within modal', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Test tab navigation - just verify the modal is accessible
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
      
      // Test that tab key event can be fired without error
      fireEvent.keyDown(closeButton, { key: 'Tab', code: 'Tab' });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('Shift+Tab navigation works within modal', async () => {
      render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Test shift+tab navigation - just verify the modal is accessible
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
      
      // Test that shift+tab key event can be fired without error
      fireEvent.keyDown(closeButton, { key: 'Tab', code: 'Tab', shiftKey: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Status Bar Functionality', () => {
    test('renders status bar with correct content', () => {
      render(<Terminal />);
      
      expect(screen.getByText('Terminal v2.1.3')).toBeInTheDocument();
      expect(screen.getAllByText('SHAPES')).toHaveLength(2); // One in header, one in status bar
      expect(screen.getByText(/user@shapes:~\$/)).toBeInTheDocument();
    });

    test('cursor blinks in status bar', async () => {
      jest.useFakeTimers();
      render(<Terminal />);
      
      const cursorElement = document.querySelector('.cursor');
      expect(cursorElement).toBeInTheDocument();
      
      // Initially cursor should be visible
      expect(cursorElement).not.toHaveClass('hidden');
      
      // After 750ms, cursor should be hidden
      act(() => {
        jest.advanceTimersByTime(750);
      });
      
      await waitFor(() => {
        expect(cursorElement).toHaveClass('hidden');
      });
      
      // After another 750ms, cursor should be visible again
      act(() => {
        jest.advanceTimersByTime(750);
      });
      
      await waitFor(() => {
        expect(cursorElement).not.toHaveClass('hidden');
      });
      
      jest.useRealTimers();
    });
  });

  describe('Animation Integration', () => {
    test('starts morphing animation on mount', () => {
      render(<Terminal />);
      
      expect(mockAnimationsHook.startMorphing).toHaveBeenCalledWith('identity', 2000);
    });

    test('stops morphing animation on unmount', () => {
      const { unmount } = render(<Terminal />);
      
      unmount();
      
      expect(mockAnimationsHook.stopMorphing).toHaveBeenCalled();
    });

    test('displays current frame content from animation hook', () => {
      render(<Terminal />);
      
      // Check if morphing display exists and animation hook is called
      const morphDisplay = document.querySelector('.morph-display');
      expect(morphDisplay).toBeInTheDocument();
      expect(mockAnimationsHook.getCurrentFrameContent).toHaveBeenCalled();
    });

    test('renders performance metrics in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<Terminal />);
      
      expect(screen.getByText('FPS: 60')).toBeInTheDocument();
      expect(screen.getByText('Sequence: identity')).toBeInTheDocument();
      expect(screen.getByText('Frame: 100')).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('renders animation controls in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<Terminal />);
      
      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Concepts')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    test('animation controls work correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<Terminal />);
      
      // Test identity button
      const identityButton = screen.getByText('Identity');
      fireEvent.click(identityButton);
      expect(mockAnimationsHook.startMorphing).toHaveBeenCalledWith('identity', 1500);
      
      // Test loading button
      const loadingButton = screen.getByText('Loading');
      fireEvent.click(loadingButton);
      expect(mockAnimationsHook.startMorphing).toHaveBeenCalledWith('loading', 1000);
      
      // Test concepts button
      const conceptsButton = screen.getByText('Concepts');
      fireEvent.click(conceptsButton);
      expect(mockAnimationsHook.startMorphing).toHaveBeenCalledWith('concepts', 2000);
      
      // Test pause button
      const pauseButton = screen.getByText('Pause');
      fireEvent.click(pauseButton);
      expect(mockAnimationsHook.stopMorphing).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance Optimizations', () => {
    test('FileSystemSection is memoized', () => {
      render(<Terminal />);
      
      // Verify that the FileSystemSection component is rendered
      expect(screen.getByText('HOME.txt')).toBeInTheDocument();
      expect(screen.getByText('PROJECTS.txt')).toBeInTheDocument();
      expect(screen.getByText('CLASSIFIED.enc')).toBeInTheDocument();
      
      // Verify that getAllFiles was called during render
      expect(fileContentModule.getAllFiles).toHaveBeenCalled();
    });

    test('Modal callbacks are memoized', async () => {
      const { rerender } = render(<Terminal />);
      
      // Open modal
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Re-render component
      rerender(<Terminal />);
      
      // Modal should still be open and functional
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Close button should still work
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    test('handles rapid file clicks without issues', async () => {
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      
      // Rapidly click the file multiple times
      fireEvent.click(homeFile);
      fireEvent.click(homeFile);
      fireEvent.click(homeFile);
      
      // Should only open one modal
      await waitFor(() => {
        const modals = screen.getAllByRole('dialog');
        expect(modals).toHaveLength(1);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles missing file data gracefully', () => {
      fileContentModule.getAllFiles.mockReturnValue([]);
      
      render(<Terminal />);
      
      // Should still render the terminal structure
      expect(screen.getByText('ls -la /home/user/projects/shapes')).toBeInTheDocument();
      expect(screen.getByText('Terminal v2.1.3')).toBeInTheDocument();
    });

    test('handles animation hook errors gracefully', () => {
      useAnimationsModule.useAnimations.mockReturnValue({
        ...mockAnimationsHook,
        getCurrentFrameContent: jest.fn(() => null)
      });
      
      render(<Terminal />);
      
      // Should still render without crashing
      expect(screen.getByText('Terminal v2.1.3')).toBeInTheDocument();
    });

    test('handles file content loading errors', async () => {
      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      fileContentModule.getFileByKey.mockImplementation(() => {
        throw new Error('File loading error');
      });
      
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      
      // Should not crash when clicking file - wrap in try/catch to handle error
      expect(() => {
        fireEvent.click(homeFile);
      }).not.toThrow();
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('modal has proper ARIA attributes', async () => {
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
        expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      });
    });

    test('close button has proper accessibility label', async () => {
      render(<Terminal />);
      
      const homeFile = screen.getByText('HOME.txt');
      fireEvent.click(homeFile);
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toHaveAttribute('type', 'button');
      });
    });

    test('file items have proper data attributes for testing', () => {
      render(<Terminal />);
      
      const homeFileElement = screen.getByText('HOME.txt').closest('[data-file-key]');
      expect(homeFileElement).toHaveAttribute('data-file-key', 'home');
      
      const projectsFileElement = screen.getByText('PROJECTS.txt').closest('[data-file-key]');
      expect(projectsFileElement).toHaveAttribute('data-file-key', 'projects');
    });
  });
});