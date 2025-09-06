import React, { useState } from 'react';
import { 
  Button, 
  Tooltip, 
  CircularProgress,
  Badge
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAppSelector } from '@/app/hooks';
import { selectIsGenerating, selectIsConfigured } from '../model/aiTestSlice';
import { TestGeneratorModal } from './TestGeneratorModal';

interface TestGeneratorButtonProps {
  sectionContent: string;
  sectionType: 'static' | 'dynamic';
  sectionId?: string;
  existingVariables?: Record<string, any>;
  onTestsGenerated?: (tests: any[]) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  fullWidth?: boolean;
  disabled?: boolean;
  testCount?: number;
  className?: string;
}

export const TestGeneratorButton: React.FC<TestGeneratorButtonProps> = ({
  sectionContent,
  sectionType,
  sectionId,
  existingVariables,
  onTestsGenerated,
  size = 'medium',
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  testCount = 0,
  className
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isGenerating = useAppSelector(selectIsGenerating);
  const isConfigured = useAppSelector(selectIsConfigured);

  const handleClick = () => {
    if (!isConfigured) {
      alert('Please configure AI settings first');
      return;
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleTestsGenerated = (tests: any[]) => {
    if (onTestsGenerated) {
      onTestsGenerated(tests);
    }
    setModalOpen(false);
  };

  const buttonDisabled = disabled || isGenerating || !isConfigured || !sectionContent;

  const tooltipTitle = !isConfigured 
    ? 'Configure AI settings first'
    : !sectionContent
    ? 'No content to generate tests for'
    : isGenerating
    ? 'Generating tests...'
    : testCount > 0
    ? `Generate AI tests (${testCount} existing)`
    : 'Generate AI tests';

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <span>
          <Button
            onClick={handleClick}
            disabled={buttonDisabled}
            size={size}
            variant={variant}
            color={color}
            fullWidth={fullWidth}
            className={className}
            startIcon={
              isGenerating ? (
                <CircularProgress size={16} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
          >
            {testCount > 0 ? (
              <Badge badgeContent={testCount} color="secondary">
                <span style={{ marginRight: 20 }}>AI Tests</span>
              </Badge>
            ) : (
              'Generate Tests'
            )}
          </Button>
        </span>
      </Tooltip>

      <TestGeneratorModal
        open={modalOpen}
        onClose={handleModalClose}
        sectionContent={sectionContent}
        sectionType={sectionType}
        sectionId={sectionId}
        existingVariables={existingVariables}
        onTestsGenerated={handleTestsGenerated}
      />
    </>
  );
};

export default TestGeneratorButton;