import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Divider,
  Alert
} from '@mui/material';
import { evaluateDynamicSection, interpolateVariables } from '@/features/text-editor/lib/evaluator';

const exampleCode = {
  formatting: `// Text Formatting Example
const status = "Critical";
return kpt.boldText(kpt.redText(status));`,
  
  numbers: `// Number Formatting Example
const value = 1234567.89;
return [
  "Number: " + kpt.formatNumber(value),
  "Currency: " + kpt.formatCurrency(value),
  "Percent: " + kpt.formatPercent(75.5)
].join("\\n");`,
  
  tpn: `// TPN Formatting Example
const weight = 0.5; // kg
const volume = 1500; // mL
const dose = 0.5; // mg
return [
  "Weight: " + kpt.formatWeight(weight),
  "Volume: " + kpt.formatVolume(volume),
  "Dose: " + kpt.formatDose(dose)
].join("\\n");`,
  
  conditional: `// Conditional Display Example
const value = 15;
return [
  kpt.whenAbove(value, 10, "Value is high: " + value),
  kpt.whenBelow(value, 20, "Value is below 20"),
  kpt.showIf(value > 10, kpt.greenText("✓ Condition met"))
].filter(Boolean).join("\\n");`,
  
  ranges: `// Range Checking Example
const sodium = 135;
const status = kpt.checkRange(sodium, [136, 145], [130, 150]);
const color = status === 'normal' ? 'green' : status === 'abnormal' ? 'orange' : 'red';
return kpt.createAlert(
  "Sodium: " + sodium + " mEq/L - Status: " + status,
  status === 'normal' ? 'success' : status === 'abnormal' ? 'warning' : 'error'
);`,
  
  table: `// HTML Table Example
const data = [
  ["Glucose", "180 mg/dL", kpt.redText("High")],
  ["Sodium", "140 mEq/L", kpt.greenText("Normal")],
  ["Potassium", "4.0 mEq/L", kpt.greenText("Normal")]
];
return kpt.createTable(data, ["Parameter", "Value", "Status"]);`,
};

export function KPTDemo() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof exampleCode>('formatting');
  const [customCode, setCustomCode] = useState(exampleCode.formatting);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [interpolationText, setInterpolationText] = useState('Weight: ${kpt.formatWeight(75)}');
  const [interpolationOutput, setInterpolationOutput] = useState('');

  const runCode = () => {
    const result = evaluateDynamicSection(customCode);
    if (result.success) {
      setOutput(result.output);
      setError('');
    } else {
      setOutput('');
      setError(result.error || 'Unknown error');
    }
  };

  const runInterpolation = () => {
    try {
      const result = interpolateVariables(interpolationText, { 
        weight: 75,
        sodium: 140,
        glucose: 180
      });
      setInterpolationOutput(result);
    } catch (err) {
      setInterpolationOutput(`Error: ${err}`);
    }
  };

  const selectExample = (key: keyof typeof exampleCode) => {
    setSelectedExample(key);
    setCustomCode(exampleCode[key]);
    setError('');
    setOutput('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        KPT Functions Demo
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        The KPT namespace provides formatting and utility functions for dynamic text sections.
        All functions are available via the <code>kpt</code> object.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Examples
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Button 
                variant={selectedExample === 'formatting' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('formatting')}
              >
                Text Formatting
              </Button>
              <Button 
                variant={selectedExample === 'numbers' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('numbers')}
              >
                Numbers
              </Button>
              <Button 
                variant={selectedExample === 'tpn' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('tpn')}
              >
                TPN
              </Button>
              <Button 
                variant={selectedExample === 'conditional' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('conditional')}
              >
                Conditional
              </Button>
              <Button 
                variant={selectedExample === 'ranges' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('ranges')}
              >
                Ranges
              </Button>
              <Button 
                variant={selectedExample === 'table' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => selectExample('table')}
              >
                Table
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={10}
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              variant="outlined"
              sx={{ fontFamily: 'monospace', mb: 2 }}
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={runCode}
              fullWidth
            >
              Run Code
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Output
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {output && (
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  minHeight: 200,
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse'
                  },
                  '& th, & td': {
                    padding: '8px',
                    border: '1px solid #e0e0e0'
                  },
                  '& th': {
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: output }}
              />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Text Interpolation Demo
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Use <code>${'{kpt.functionName(args)}'}</code> syntax in text
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={interpolationText}
                  onChange={(e) => setInterpolationText(e.target.value)}
                  variant="outlined"
                  label="Text with interpolation"
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={runInterpolation}
                  fullWidth
                >
                  Interpolate
                </Button>
                
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Available variables: weight (75), sodium (140), glucose (180)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Result:
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1,
                    minHeight: 100
                  }}
                  dangerouslySetInnerHTML={{ __html: interpolationOutput || '(No output yet)' }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}