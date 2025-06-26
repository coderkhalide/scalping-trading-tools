
# Trading Position Grader

A comprehensive application for evaluating and grading trading positions using weighted factors, risk management, and automated trade logging. This system helps traders make data-driven decisions by scoring potential trades and managing position sizes based on setup quality.

## 🎯 Overview

The Trading Position Grader is designed to eliminate emotional trading decisions by providing a systematic approach to evaluating trade setups. It combines technical analysis factors, risk management principles, and automated logging to create a complete trading workflow.

## Live Demo
[View Live Demo](https://trading-tools.khaliddev.com/)

## ✨ Key Features

### 📊 **Multi-Factor Grading System**
- **Weighted Factor Groups**: Organize trading criteria into logical groups (e.g., "15 Minute Setup", "1 Minute Entry")
- **Individual Factor Scoring**: Grade each factor from 0-100% with visual feedback
- **AND/OR Logic**: Configure whether all factors in a group must meet criteria (AND) or any factor (OR)
- **Mandatory Factors**: Set critical factors that must meet minimum thresholds
- **Bonus Point System**: Award extra points for exceptional setups that exceed normal criteria

### 🎓 **Letter Grade System**
- **A++++ (150+)**: Legendary Setup - Maximum position size recommended
- **A+++ (130-149)**: Exceptional Setup - Large position size
- **A++ (110-129)**: Premium Setup - Above-average position size
- **A+ (95-109)**: Excellent Setup - Good position size
- **A (85-94)**: Very Good Setup - Standard position size
- **B (75-84)**: Good Setup - Reduced position size
- **C-F (Below 75)**: Poor Setup - Minimal or no position

### 💰 **Advanced Risk Management**
- **Grade-Based Position Sizing**: Automatically calculate position sizes based on trade grade
- **Risk Tolerance Settings**: Configure acceptable deviation from recommended risk
- **Fee Integration**: Account for trading fees in risk calculations
- **Breakeven Price Calculator**: Know exactly where you break even including fees
- **R-Multiple Tracking**: Track performance in risk multiples (R)

### 📈 **Real-Time P&L Analysis**
- **Live P&L Calculation**: See profit/loss as you enter exit prices
- **R-Multiple Breakdown**: View Gross R, Fee R, and Net R separately
- **Breakeven Monitoring**: Copy breakeven prices to clipboard for easy order placement
- **Performance Tracking**: Historical win/loss tracking with detailed analytics

### 📝 **Comprehensive Trade Logging**
- **Draft System**: Save incomplete trades and resume later
- **Factor State Preservation**: Restore exact factor grades when editing drafts
- **Multiple Export Formats**: Export to Excel, CSV, or detailed reports
- **Risk Analysis Logging**: Track recommended vs. actual risk for each trade
- **Historical Factor Grades**: View the exact factor scores used for each historical trade

### ⚙️ **Flexible Configuration**
- **Multiple Trading Systems**: Create and switch between different trading strategies
- **Asset Management**: Configure fees and minimum increments for different assets
- **Custom Timeframes**: Support for 1m, 5m, 15m, 1h, 4h, 1d timeframes
- **Responsive Layout**: Auto, stacked, or side-by-side layout options
- **Data Persistence**: All settings saved to browser localStorage

## Screen Shots
![System Evaluation](https://raw.githubusercontent.com/coderkhalide/scalping-trading-tools/main/public/scalping-tools-1.png)
![Position Sizing](https://raw.githubusercontent.com/coderkhalide/scalping-trading-tools/main/public/scalping-tools-2.png)
![System Information](https://raw.githubusercontent.com/coderkhalide/scalping-trading-tools/main/public/scalping-tools-3.png)

## 🚀 How It Works

### 1. **System Setup**
1. Create or select a trading system
2. Configure factor groups (e.g., "Higher Timeframe Analysis", "Entry Signals")
3. Add individual factors with weights and timeframes
4. Set up bonus rules for exceptional setups
5. Configure risk management settings and asset fees

### 2. **Trade Evaluation**
1. Grade each factor from 0-100% using the intuitive slider interface
2. Watch the real-time score calculation and letter grade
3. Review the detailed score breakdown showing each factor's contribution
4. Check if bonus rules are triggered for additional points

### 3. **Position Sizing**
1. Enter trade details (symbol, direction, entry, stop loss)
2. View recommended position size based on your grade and risk settings
3. See risk tolerance analysis (within/over/under recommended risk)
4. Use the position size adjustment buttons for fine-tuning
5. Monitor breakeven price and fee impact

### 4. **Trade Execution & Logging**
1. Save as draft while planning or complete trade when executed
2. Add exit price for automatic P&L calculation
3. View R-multiple performance (Gross R, Fee R, Net R)
4. Export trade logs for external analysis
5. Review historical performance and factor effectiveness

## 🎛️ Interface Components

### **Score Display**
- Large, color-coded total score and letter grade
- Visual progress bar with bonus point indication
- Detailed factor contribution breakdown
- Premium setup notifications for high scores

### **Factor Groups**
- Collapsible groups with AND/OR logic selection
- Individual factor sliders with quick preset buttons (0, 25, 50, 75, 90, 100)
- Weight distribution with normalization tools
- Mandatory factor indicators and thresholds

### **Risk Calculator**
- Real-time risk calculation (Price Risk + Fees = Total Risk)
- Position size recommendations with tolerance bands
- Alternative position sizes within acceptable risk range
- Grade-based risk allocation display

### **Trade Logger**
- Clean form interface with paste buttons for quick data entry
- Position size increment/decrement buttons
- Real-time P&L calculator with R-multiple breakdown
- Draft management system with factor state restoration

### **Trade History**
- Separate draft and completed trade sections
- Detailed trade view with factor grades at time of execution
- Risk analysis comparison (recommended vs. actual)
- One-click export to CSV/Excel formats

## 📊 Scoring Algorithm

The scoring system uses a sophisticated weighted calculation:

1. **Factor Evaluation**: Each factor is graded 0-100% based on signal strength
2. **Threshold Checking**: Factors must meet minimum thresholds (25% normal, 50% mandatory)
3. **Group Calculation**: 
   - **AND Groups**: All factors must meet thresholds; score is weighted average
   - **OR Groups**: Any factor meeting threshold contributes to group score
4. **Weight Normalization**: Group scores are weighted by group importance
5. **Bonus Application**: Additional points awarded for exceptional multi-factor alignment
6. **Final Grade**: Letter grade assigned based on total score with bonus points

## 🛡️ Risk Management Philosophy

The system implements a grade-based risk allocation strategy:

- **Higher Grade = Higher Risk**: Better setups warrant larger position sizes
- **Fee Integration**: All risk calculations include trading fees
- **Tolerance Bands**: Acceptable deviation from recommended risk (±10% default)
- **R-Multiple Focus**: Performance measured in risk multiples, not just dollars
- **Breakeven Awareness**: Always know your breakeven price including fees

## 💾 Data Management

- **Local Storage**: All data automatically saved to browser
- **Export/Import**: Full system backup and restore capability
- **Trade History**: Comprehensive logging with factor state preservation
- **Asset Configuration**: Customizable fee structures and trading increments

## 🎨 User Experience

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Visual Feedback**: Color-coded grades, progress bars, and status indicators
- **Quick Actions**: Paste buttons, increment controls, and preset grade buttons
- **Layout Flexibility**: Choose between auto, stacked, or side-by-side layouts
- **Keyboard Shortcuts**: Efficient navigation and data entry

## 🔧 Technical Features

- **React + TypeScript**: Type-safe, modern web application
- **Real-time Calculations**: Instant feedback on all changes
- **Component Architecture**: Modular, maintainable code structure
- **State Management**: Efficient local state with persistence
- **Error Handling**: Graceful handling of edge cases and invalid inputs

## 📈 Use Cases

- **Day Trading**: Quick evaluation of intraday setups
- **Swing Trading**: Multi-timeframe analysis for position trades
- **Risk Management**: Consistent position sizing across all trades
- **Performance Analysis**: Historical tracking of factor effectiveness
- **System Development**: A/B testing different trading approaches
- **Education**: Learning systematic trade evaluation

## 🎯 Benefits

- **Eliminates Emotional Trading**: Data-driven decision making
- **Consistent Position Sizing**: Risk-adjusted position sizes based on setup quality
- **Improved Performance**: Focus on high-probability setups
- **Better Risk Management**: Never risk more than planned
- **Historical Analysis**: Learn from past trades and factor performance
- **Time Efficiency**: Quick setup evaluation and trade logging

---

*Built with React, TypeScript, and Tailwind CSS. Designed for serious traders who want to systematize their approach and improve their edge in the markets.*