// Static Site Controls Script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Static site loaded successfully!');
    
    // Get all step inputs
    const stepInputs = document.querySelectorAll('.step-item input[type="text"]');
    const previewContent = document.querySelector('.preview-content');
    
    // Image upload elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileInfo = document.getElementById('fileInfo');
    
    // Analysis elements
    const runAnalysisBtn = document.getElementById('runAnalysisBtn');
    const analysisResults = document.getElementById('analysisResults');
    
    // Copy generation elements
    const generateCopyBtn = document.getElementById('generateCopyBtn');
    const copyOptions = document.getElementById('copyOptions');
    const copyCards = document.getElementById('copyCards');
    
    // Style toggle elements
    const studioRadio = document.getElementById('studioRadio');
    const natureRadio = document.getElementById('natureRadio');
    
    // Settings elements
    const fidelityRadios = document.querySelectorAll('input[name="fidelity"]');
    const qualityRadios = document.querySelectorAll('input[name="quality"]');
    
    // Export elements
    const exportBtn = document.getElementById('exportBtn');
    const generateNewBtn = document.getElementById('generateNewBtn');
    const exportScaleDisplay = document.getElementById('exportScale');
    const adaWarnings = document.getElementById('adaWarnings');
    const warningsList = document.getElementById('warningsList');
    
    // Global variables to store data
    let currentImageData = null;
    let currentAnalysis = null;
    let chosenCopy = null;
    let adStyle = null;
    let fidelity = null;
    let quality = null;
    let exportScale = 1; // Default scale
    let adSeed = Math.random(); // Random seed for ad variations
    
    // Initialize image upload functionality
    initImageUploader();
    
    // Initialize analysis functionality
    initAnalysis();
    
    // Initialize copy generation functionality
    initCopyGeneration();
    
    // Initialize style toggle functionality
    initStyleToggles();
    
    // Initialize settings functionality
    initSettings();
    
    // Initialize export functionality
    initExport();
    
    // Add event listeners to all step inputs
    stepInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            updatePreview();
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3498db';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#e0e0e0';
            }
        });
    });
    
    // Function to update preview content
    function updatePreview() {
        const steps = [];
        stepInputs.forEach((input, index) => {
            if (input.value.trim()) {
                steps.push(`Step ${index + 1}: ${input.value.trim()}`);
            }
        });
        
        if (steps.length > 0) {
            previewContent.innerHTML = `
                <div style="text-align: left; padding: 20px;">
                    <h3 style="margin-bottom: 15px; color: #2c3e50;">Current Steps:</h3>
                    <ul style="list-style-type: none; padding: 0;">
                        ${steps.map(step => `<li style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 4px; border-left: 4px solid #3498db;">${step}</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            previewContent.innerHTML = '<p>Preview content will appear here</p>';
        }
    }
    
    // Add some sample functionality
    function addStepValidation() {
        stepInputs.forEach((input, index) => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const nextInput = stepInputs[index + 1];
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
            });
        });
    }
    
    addStepValidation();
    
    // Image Upload Functionality
    function initImageUploader() {
        // Drag and drop events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        
        // File input change event
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        }
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    }
    
    function handleImageFile(file) {
        // Show file info
        const fileName = file.name;
        fileInfo.querySelector('.file-name').textContent = fileName;
        fileInfo.style.display = 'flex';
        dropZone.style.display = 'none';
        
        // Create image URL and display in preview
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImageData = e.target.result; // Store base64 data for analysis
            createSKULayer(e.target.result, fileName);
            
            // Enable analysis button
            runAnalysisBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    function createSKULayer(imageSrc, fileName) {
        // Remove existing SKU layer if any
        const existingSKU = previewContent.querySelector('.sku-layer');
        if (existingSKU) {
            existingSKU.remove();
        }
        
        // Create SKU layer element
        const skuLayer = document.createElement('div');
        skuLayer.className = 'sku-layer';
        skuLayer.innerHTML = `
            <div class="layer-label">SKU</div>
            <img src="${imageSrc}" alt="${fileName}">
        `;
        
        // Add to preview content
        previewContent.classList.add('has-sku');
        previewContent.appendChild(skuLayer);
        
        // Position the SKU layer (70% of stage height, right side)
        const stageRect = previewContent.getBoundingClientRect();
        const img = skuLayer.querySelector('img');
        
        img.onload = function() {
            const maxHeight = stageRect.height * 0.7;
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            
            let layerHeight = maxHeight;
            let layerWidth = layerHeight * aspectRatio;
            
            // If width exceeds stage width, scale down
            if (layerWidth > stageRect.width * 0.4) {
                layerWidth = stageRect.width * 0.4;
                layerHeight = layerWidth / aspectRatio;
            }
            
            skuLayer.style.width = layerWidth + 'px';
            skuLayer.style.height = layerHeight + 'px';
            
            // Position on right side
            const rightPosition = stageRect.width - layerWidth - 20;
            const topPosition = (stageRect.height - layerHeight) / 2;
            
            skuLayer.style.left = rightPosition + 'px';
            skuLayer.style.top = topPosition + 'px';
            
            // Make draggable
            makeDraggable(skuLayer);
        };
    }
    
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        element.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        function startDrag(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = element.getBoundingClientRect();
            const parentRect = previewContent.getBoundingClientRect();
            
            initialX = rect.left - parentRect.left;
            initialY = rect.top - parentRect.top;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newX = initialX + deltaX;
            let newY = initialY + deltaY;
            
            // Constrain within preview stage bounds
            const parentRect = previewContent.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            
            const maxX = parentRect.width - elementRect.width;
            const maxY = parentRect.height - elementRect.height;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        }
        
        function stopDrag() {
            isDragging = false;
            element.style.cursor = 'move';
        }
    }
    
    // Analysis functionality
    function initAnalysis() {
        runAnalysisBtn.addEventListener('click', runProductAnalysis);
    }
    
    async function runProductAnalysis() {
        if (!currentImageData) {
            alert('Please upload an image first');
            return;
        }
        
        // Update button state
        runAnalysisBtn.classList.add('loading');
        runAnalysisBtn.disabled = true;
        runAnalysisBtn.querySelector('.btn-text').style.display = 'none';
        runAnalysisBtn.querySelector('.btn-loading').style.display = 'flex';
        
        try {
            let data;
            
            // Check if we're running from file:// protocol (local file)
            if (window.location.protocol === 'file:') {
                // Use simulated analysis for local development
                data = await simulateProductAnalysis(currentImageData);
            } else {
                // Call the actual analysis API
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image_b64: currentImageData
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                data = await response.json();
            }
            
            if (data.success) {
                displayAnalysisResults(data.analysis);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            // Reset button state
            runAnalysisBtn.classList.remove('loading');
            runAnalysisBtn.disabled = false;
            runAnalysisBtn.querySelector('.btn-text').style.display = 'inline';
            runAnalysisBtn.querySelector('.btn-loading').style.display = 'none';
        }
    }
    
    // Simulated product analysis for local development (file:// protocol)
    async function simulateProductAnalysis(imageData) {
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // IMPORTANT: This is a simulation for local development only
        // Real product analysis requires a vision-language model API like OpenAI GPT-4 Vision
        console.warn('⚠️ SIMULATION MODE: This is not real image analysis. Deploy to a server with AI APIs for accurate product identification.');
        
        // Try to extract some basic image characteristics for better simulation
        let imageHints = {
            isLarge: imageData.length > 500000, // Large file might be high-res product photo
            format: imageData.includes('data:image/jpeg') ? 'jpeg' : 'png',
            hasTransparency: imageData.includes('data:image/png'),
            timestamp: Date.now()
        };
        
        // Create a more sophisticated analysis based on multiple factors
        const analysisOptions = [
            {
                productType: 'Wireless Bluetooth Headphones',
                keyFeatures: ['Active noise cancellation', 'Premium leather padding', '30-hour battery life', 'Quick charge technology', 'Foldable design'],
                targetAudience: 'Music enthusiasts and commuters',
                brandPositioning: {
                    tone: 'premium',
                    style: 'bold',
                    description: 'Premium bold positioning - High-end audio experience for discerning listeners'
                }
            },
            {
                productType: 'Smartphone Case',
                keyFeatures: ['Drop protection up to 10ft', 'Wireless charging compatible', 'Slim profile design', 'Anti-fingerprint coating'],
                targetAudience: 'Tech-savvy professionals and students',
                brandPositioning: {
                    tone: 'budget-friendly',
                    style: 'minimal',
                    description: 'Budget-friendly minimal positioning - Essential protection without the bulk'
                }
            },
            {
                productType: 'Stainless Steel Water Bottle',
                keyFeatures: ['Double-wall vacuum insulation', '24-hour cold retention', 'Leak-proof cap', 'BPA-free materials', 'Wide mouth opening'],
                targetAudience: 'Health-conscious individuals and outdoor enthusiasts',
                brandPositioning: {
                    tone: 'premium',
                    style: 'minimal',
                    description: 'Premium minimal positioning - Clean design meets superior performance'
                }
            },
            {
                productType: 'Gaming Mechanical Keyboard',
                keyFeatures: ['RGB backlighting', 'Tactile mechanical switches', 'Programmable macro keys', 'Anti-ghosting technology', 'Detachable cable'],
                targetAudience: 'Gaming enthusiasts and programmers',
                brandPositioning: {
                    tone: 'budget-friendly',
                    style: 'bold',
                    description: 'Budget-friendly bold positioning - Professional gaming performance at an accessible price'
                }
            },
            {
                productType: 'Ceramic Coffee Mug',
                keyFeatures: ['Heat-retaining ceramic', 'Comfortable grip handle', 'Microwave safe', 'Dishwasher friendly', 'Elegant matte finish'],
                targetAudience: 'Coffee lovers and office workers',
                brandPositioning: {
                    tone: 'budget-friendly',
                    style: 'minimal',
                    description: 'Budget-friendly minimal positioning - Simple elegance for everyday moments'
                }
            },
            {
                productType: 'Fitness Tracker Watch',
                keyFeatures: ['Heart rate monitoring', 'Sleep tracking', '7-day battery life', 'Water resistant to 50m', 'Smartphone notifications'],
                targetAudience: 'Fitness enthusiasts and health-conscious individuals',
                brandPositioning: {
                    tone: 'premium',
                    style: 'bold',
                    description: 'Premium bold positioning - Advanced health insights for serious athletes'
                }
            },
            {
                productType: 'LED Desk Lamp',
                keyFeatures: ['Adjustable brightness levels', 'USB charging port', 'Flexible arm design', 'Eye-care LED technology', 'Touch controls'],
                targetAudience: 'Students, remote workers, and creative professionals',
                brandPositioning: {
                    tone: 'budget-friendly',
                    style: 'minimal',
                    description: 'Budget-friendly minimal positioning - Smart lighting for productive workspaces'
                }
            },
            {
                productType: 'Wireless Charging Pad',
                keyFeatures: ['Fast 15W charging', 'Universal compatibility', 'LED charging indicator', 'Non-slip surface', 'Overheating protection'],
                targetAudience: 'Tech professionals and smartphone users',
                brandPositioning: {
                    tone: 'premium',
                    style: 'minimal',
                    description: 'Premium minimal positioning - Effortless charging with sophisticated design'
                }
            },
            {
                productType: 'Bluetooth Portable Speaker',
                keyFeatures: ['360-degree sound', 'Waterproof rating IPX7', '12-hour playtime', 'Voice assistant compatible', 'Compact travel size'],
                targetAudience: 'Music lovers and outdoor adventurers',
                brandPositioning: {
                    tone: 'budget-friendly',
                    style: 'bold',
                    description: 'Budget-friendly bold positioning - Big sound, small price, endless adventures'
                }
            },
            {
                productType: 'Ergonomic Office Chair',
                keyFeatures: ['Lumbar support system', 'Breathable mesh back', 'Height adjustable', 'Armrest customization', '360-degree swivel'],
                targetAudience: 'Remote workers and office professionals',
                brandPositioning: {
                    tone: 'premium',
                    style: 'minimal',
                    description: 'Premium minimal positioning - Professional comfort meets timeless design'
                }
            }
        ];
        
        // Use multiple factors to create more varied selection
        const timestamp = Date.now();
        const imageSize = imageData.length;
        const imageType = imageData.includes('data:image/jpeg') ? 'jpeg' : 'png';
        
        // Create a more complex seed using multiple factors
        const complexSeed = (timestamp % 1000) + (imageSize % 100) + (imageType === 'jpeg' ? 50 : 25);
        const selectedIndex = complexSeed % analysisOptions.length;
        
        // Add some randomization to features (remove 0-2 features randomly)
        const selectedAnalysis = { ...analysisOptions[selectedIndex] };
        const featuresToRemove = Math.floor(Math.random() * 3);
        if (featuresToRemove > 0 && selectedAnalysis.keyFeatures.length > 3) {
            selectedAnalysis.keyFeatures = selectedAnalysis.keyFeatures.slice(0, -featuresToRemove);
        }
        
        // Add simulation disclaimer to the analysis
        selectedAnalysis.simulationNote = "⚠️ SIMULATION: This analysis is randomly generated for demo purposes. Real product identification requires AI vision APIs.";
        
        return {
            success: true,
            analysis: selectedAnalysis
        };
    }
    
    function displayAnalysisResults(analysis) {
        // Store analysis data for copy generation
        currentAnalysis = analysis;
        
        // Show simulation disclaimer if present
        if (analysis.simulationNote) {
            // Create or update disclaimer element
            let disclaimer = document.getElementById('simulationDisclaimer');
            if (!disclaimer) {
                disclaimer = document.createElement('div');
                disclaimer.id = 'simulationDisclaimer';
                disclaimer.style.cssText = `
                    background: #4a3c1a;
                    border: 1px solid #8b7a00;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 15px;
                    color: #ffd54f;
                    font-size: 14px;
                    font-weight: 500;
                `;
                analysisResults.insertBefore(disclaimer, analysisResults.firstChild);
            }
            disclaimer.textContent = analysis.simulationNote;
        }
        
        // Populate the results
        document.getElementById('productType').textContent = analysis.productType;
        
        // Format key features as a list
        const featuresHtml = '<ul>' + 
            analysis.keyFeatures.map(feature => `<li>${feature}</li>`).join('') + 
            '</ul>';
        document.getElementById('keyFeatures').innerHTML = featuresHtml;
        
        document.getElementById('targetAudience').textContent = analysis.targetAudience;
        document.getElementById('brandPositioning').textContent = analysis.brandPositioning.description;
        
        // Show results
        analysisResults.style.display = 'block';
        
        // Enable copy generation button
        generateCopyBtn.disabled = false;
        
        // Check if export should be enabled
        checkExportReadiness();
    }
    
    // Global function for removing file
    window.removeFile = function() {
        fileInfo.style.display = 'none';
        dropZone.style.display = 'block';
        fileInput.value = '';
        currentImageData = null;
        
        // Disable analysis button
        runAnalysisBtn.disabled = true;
        
        // Hide analysis results
        analysisResults.style.display = 'none';
        
        // Reset copy generation
        currentAnalysis = null;
        chosenCopy = null;
        generateCopyBtn.disabled = true;
        copyOptions.style.display = 'none';
        
        // Remove SKU layer
        const skuLayer = previewContent.querySelector('.sku-layer');
        if (skuLayer) {
            skuLayer.remove();
            previewContent.classList.remove('has-sku');
        }
    };
    
    // Copy Generation Functionality
    function initCopyGeneration() {
        generateCopyBtn.addEventListener('click', generateMarketingCopy);
    }
    
    async function generateMarketingCopy() {
        if (!currentAnalysis) {
            alert('Please run product analysis first');
            return;
        }
        
        // Update button state
        generateCopyBtn.classList.add('loading');
        generateCopyBtn.disabled = true;
        generateCopyBtn.querySelector('.btn-text').style.display = 'none';
        generateCopyBtn.querySelector('.btn-loading').style.display = 'flex';
        
        try {
            let data;
            
            // Check if we're running from file:// protocol (local file)
            if (window.location.protocol === 'file:') {
                // Use simulated copy generation for local development
                data = await simulateMarketingCopy(currentAnalysis);
            } else {
                // Call the actual copy generation API
                const response = await fetch('/api/copy', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        analysis: currentAnalysis
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                data = await response.json();
            }
            
            if (data.success) {
                displayCopyOptions(data.copyOptions);
            } else {
                throw new Error(data.error || 'Copy generation failed');
            }
            
        } catch (error) {
            console.error('Copy generation error:', error);
            alert('Failed to generate marketing copy. Please try again.');
        } finally {
            // Reset button state
            generateCopyBtn.classList.remove('loading');
            generateCopyBtn.disabled = false;
            generateCopyBtn.querySelector('.btn-text').style.display = 'inline';
            generateCopyBtn.querySelector('.btn-loading').style.display = 'none';
        }
    }
    
    // Simulated marketing copy generation for local development (file:// protocol)
    async function simulateMarketingCopy(analysis) {
        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const { productType, keyFeatures, targetAudience, brandPositioning } = analysis;
        
        // Generate copy variations based on the analysis
        const copyTemplates = {
            premium: {
                bold: [
                    { headline: "Unleash Your Potential", subhead: "Premium performance meets cutting-edge design for professionals" },
                    { headline: "Power Redefined", subhead: "Experience excellence with our flagship innovation" },
                    { headline: "Beyond Ordinary", subhead: "Elevate your lifestyle with premium craftsmanship" }
                ],
                minimal: [
                    { headline: "Simply Superior", subhead: "Clean design, powerful performance, effortless experience" },
                    { headline: "Refined Excellence", subhead: "Thoughtfully crafted for the discerning user" },
                    { headline: "Pure Performance", subhead: "Minimalist design with maximum impact" }
                ]
            },
            'budget-friendly': {
                bold: [
                    { headline: "Big Value, Bold Style", subhead: "Get more for less with our feature-packed solution" },
                    { headline: "Smart Choice, Great Price", subhead: "Quality you can trust at a price you'll love" },
                    { headline: "Maximum Impact, Minimum Cost", subhead: "Affordable excellence that doesn't compromise on quality" }
                ],
                minimal: [
                    { headline: "Essential Excellence", subhead: "Everything you need, nothing you don't, perfectly priced" },
                    { headline: "Simple. Smart. Affordable.", subhead: "Clean design meets practical functionality" },
                    { headline: "Quality Made Accessible", subhead: "Premium features at an everyday price" }
                ]
            }
        };
        
        // Get the appropriate template set
        const templates = copyTemplates[brandPositioning.tone][brandPositioning.style];
        
        // Customize templates based on product type and features
        const copyOptions = templates.map((template, index) => {
            let customizedHeadline = template.headline;
            let customizedSubhead = template.subhead;
            
            // Add product-specific customizations
            if (productType.toLowerCase().includes('headphones') || productType.toLowerCase().includes('speaker')) {
                if (index === 0) {
                    customizedHeadline = "Sound Perfected";
                    customizedSubhead = `Crystal clear audio with ${keyFeatures[0].toLowerCase()} technology`;
                }
            } else if (productType.toLowerCase().includes('phone') || productType.toLowerCase().includes('smartphone')) {
                if (index === 0) {
                    customizedHeadline = "Stay Connected";
                    customizedSubhead = `Advanced ${productType.toLowerCase()} with ${keyFeatures[0].toLowerCase()}`;
                }
            } else if (productType.toLowerCase().includes('laptop') || productType.toLowerCase().includes('computer')) {
                if (index === 0) {
                    customizedHeadline = "Work Unleashed";
                    customizedSubhead = `Powerful computing with ${keyFeatures[0].toLowerCase()}`;
                }
            }
            
            return {
                id: `copy-${index + 1}`,
                headline: customizedHeadline,
                subhead: customizedSubhead,
                tone: brandPositioning.tone,
                style: brandPositioning.style
            };
        });
        
        return {
            success: true,
            copyOptions: copyOptions
        };
    }
    
    function displayCopyOptions(copyOptions) {
        // Clear previous options
        copyCards.innerHTML = '';
        
        // Create copy cards
        copyOptions.forEach((option, index) => {
            const card = document.createElement('div');
            card.className = 'copy-card';
            card.innerHTML = `
                <div class="copy-card-header">
                    <input type="radio" name="copyOption" value="${option.id}" class="copy-radio" id="${option.id}">
                    <div class="copy-content">
                        <h3 class="copy-headline">${option.headline}</h3>
                        <p class="copy-subhead">${option.subhead}</p>
                    </div>
                </div>
                <div class="copy-meta">
                    <span class="copy-tone">${option.tone}</span>
                    <span class="copy-confidence">${option.confidence}% confidence</span>
                </div>
            `;
            
            // Add click handler for the entire card
            card.addEventListener('click', () => selectCopyOption(option.id, card));
            
            // Add change handler for the radio button
            const radio = card.querySelector('.copy-radio');
            radio.addEventListener('change', () => selectCopyOption(option.id, card));
            
            copyCards.appendChild(card);
        });
        
        // Show copy options
        copyOptions.style.display = 'block';
    }
    
    function selectCopyOption(optionId, cardElement) {
        // Remove selection from all cards
        document.querySelectorAll('.copy-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        cardElement.classList.add('selected');
        
        // Update radio button
        const radio = cardElement.querySelector('.copy-radio');
        radio.checked = true;
        
        // Store chosen copy
        const headline = cardElement.querySelector('.copy-headline').textContent;
        const subhead = cardElement.querySelector('.copy-subhead').textContent;
        const tone = cardElement.querySelector('.copy-tone').textContent;
        
        chosenCopy = {
            id: optionId,
            headline: headline,
            subhead: subhead,
            tone: tone
        };
        
        console.log('Chosen copy:', chosenCopy);
        
        // Check if export should be enabled
        checkExportReadiness();
    }
    
    // Style Toggle Functionality
    function initStyleToggles() {
        studioRadio.addEventListener('change', handleStyleChange);
        natureRadio.addEventListener('change', handleStyleChange);
    }
    
    function handleStyleChange(event) {
        const selectedStyle = event.target.value;
        adStyle = selectedStyle;
        
        // Update preview stage background
        updatePreviewStageStyle(selectedStyle);
        
        console.log('Ad style changed to:', adStyle);
        
        // Check if export should be enabled
        checkExportReadiness();
    }
    
    function updatePreviewStageStyle(style) {
        // Remove existing style classes
        previewContent.classList.remove('studio-style', 'nature-style');
        
        // Add new style class
        if (style === 'studio') {
            previewContent.classList.add('studio-style');
        } else if (style === 'nature') {
            previewContent.classList.add('nature-style');
        }
    }
    
    // Settings Functionality
    function initSettings() {
        // Add event listeners for fidelity settings
        fidelityRadios.forEach(radio => {
            radio.addEventListener('change', handleFidelityChange);
        });
        
        // Add event listeners for quality settings
        qualityRadios.forEach(radio => {
            radio.addEventListener('change', handleQualityChange);
        });
    }
    
    function handleFidelityChange(event) {
        fidelity = event.target.value;
        console.log('Fidelity changed to:', fidelity);
    }
    
    function handleQualityChange(event) {
        quality = event.target.value;
        
        // Map quality to export scale
        switch (quality) {
            case 'low':
                exportScale = 1;
                break;
            case 'medium':
                exportScale = 1.5;
                break;
            case 'high':
                exportScale = 2;
                break;
            default:
                exportScale = 1;
        }
        
        // Update export scale display
        exportScaleDisplay.textContent = `Scale: ${exportScale}×`;
        
        // Check if export should be enabled
        checkExportReadiness();
        
        console.log('Quality changed to:', quality, '- Export scale:', exportScale + '×');
    }
    
    // Export Functionality
    function initExport() {
        exportBtn.addEventListener('click', exportScene);
        generateNewBtn.addEventListener('click', generateNewAd);
    }
    
    function checkExportReadiness() {
        // Enable export buttons if we have all required data
        const hasImage = currentImageData !== null;
        const hasCopy = chosenCopy !== null;
        const hasStyle = adStyle !== null;
        const hasQuality = quality !== null;
        
        const isReady = hasImage && hasCopy && hasStyle && hasQuality;
        exportBtn.disabled = !isReady;
        generateNewBtn.disabled = !isReady;
    }
    
    async function exportScene() {
        if (!currentImageData || !chosenCopy || !adStyle || !quality) {
            alert('Please complete all steps before exporting');
            return;
        }
        
        // Update button state
        exportBtn.classList.add('loading');
        exportBtn.disabled = true;
        exportBtn.querySelector('.btn-text').style.display = 'none';
        exportBtn.querySelector('.btn-loading').style.display = 'flex';
        
        try {
            // Clear any existing warnings
            adaWarnings.style.display = 'none';
            warningsList.innerHTML = '';
            
            // Compose the scene with text overlays
            await composeScene();
            
            // Use html2canvas to capture the preview content
            const canvas = await html2canvas(previewContent, {
                backgroundColor: null, // Transparent background
                scale: exportScale,
                width: 1942,
                height: 384,
                useCORS: true,
                allowTaint: true
            });
            
            // Create final canvas with safe background
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            
            // Draw safe background color based on style
            const backgroundColor = getSafeBackgroundColor();
            finalCtx.fillStyle = backgroundColor;
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Draw the captured content on top
            finalCtx.drawImage(canvas, 0, 0);
            
            // Download the image
            downloadCanvas(finalCanvas, 'sku-ad.png');
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export image. Please try again.');
        } finally {
            // Reset button state
            exportBtn.classList.remove('loading');
            exportBtn.disabled = false;
            exportBtn.querySelector('.btn-text').style.display = 'inline';
            exportBtn.querySelector('.btn-loading').style.display = 'none';
            
            // Remove text overlays after export
            removeTextOverlays();
        }
    }
    
    async function generateNewAd() {
        if (!currentImageData || !chosenCopy || !adStyle || !quality) {
            alert('Please complete all steps before generating a new ad');
            return;
        }
        
        // Update button state
        generateNewBtn.classList.add('loading');
        generateNewBtn.disabled = true;
        generateNewBtn.querySelector('.btn-text').style.display = 'none';
        generateNewBtn.querySelector('.btn-loading').style.display = 'flex';
        
        try {
            // Generate new seed for variations
            adSeed = Math.random();
            
            // Apply variations to SKU position
            applySkuVariations();
            
            // Apply background variations
            applyBackgroundVariations();
            
            // Clear any existing warnings
            adaWarnings.style.display = 'none';
            warningsList.innerHTML = '';
            
            // Compose the scene with text overlays
            await composeScene();
            
            // Use html2canvas to capture the preview content
            const canvas = await html2canvas(previewContent, {
                backgroundColor: null, // Transparent background
                scale: exportScale,
                width: 1942,
                height: 384,
                useCORS: true,
                allowTaint: true
            });
            
            // Create final canvas with safe background
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height;
            
            // Draw safe background color based on style
            const backgroundColor = getSafeBackgroundColor();
            finalCtx.fillStyle = backgroundColor;
            finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
            
            // Draw the captured content on top
            finalCtx.drawImage(canvas, 0, 0);
            
            // Download the image with variation suffix
            const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, '');
            downloadCanvas(finalCanvas, `sku-ad-${timestamp}.png`);
            
        } catch (error) {
            console.error('Generate new ad error:', error);
            alert('Failed to generate new ad. Please try again.');
        } finally {
            // Reset button state
            generateNewBtn.classList.remove('loading');
            generateNewBtn.disabled = false;
            generateNewBtn.querySelector('.btn-text').style.display = 'inline';
            generateNewBtn.querySelector('.btn-loading').style.display = 'none';
            
            // Remove text overlays after export
            removeTextOverlays();
        }
    }
    
    function applySkuVariations() {
        // Apply small random offset to SKU position
        const skuLayer = previewContent.querySelector('.sku-layer');
        if (skuLayer) {
            const currentLeft = parseInt(skuLayer.style.left) || 0;
            const currentTop = parseInt(skuLayer.style.top) || 0;
            
            // Generate random offset based on seed (-20px to +20px)
            const offsetX = (adSeed * 40 - 20) * Math.sin(adSeed * 10);
            const offsetY = (adSeed * 40 - 20) * Math.cos(adSeed * 10);
            
            // Apply offset while keeping within bounds
            const stageRect = previewContent.getBoundingClientRect();
            const elementRect = skuLayer.getBoundingClientRect();
            
            const newX = Math.max(0, Math.min(currentLeft + offsetX, stageRect.width - elementRect.width));
            const newY = Math.max(0, Math.min(currentTop + offsetY, stageRect.height - elementRect.height));
            
            skuLayer.style.left = newX + 'px';
            skuLayer.style.top = newY + 'px';
        }
    }
    
    function applyBackgroundVariations() {
        // Apply subtle background variations based on seed
        const variation = Math.sin(adSeed * 6.28) * 0.1; // -0.1 to +0.1
        
        // Remove existing variation classes
        previewContent.classList.remove('bg-variation-1', 'bg-variation-2', 'bg-variation-3');
        
        // Apply new variation class based on seed
        if (variation < -0.033) {
            previewContent.classList.add('bg-variation-1');
        } else if (variation > 0.033) {
            previewContent.classList.add('bg-variation-2');
        } else {
            previewContent.classList.add('bg-variation-3');
        }
    }
    
    async function composeScene() {
        // Remove any existing text overlays
        removeTextOverlays();
        
        if (!chosenCopy) return;
        
        // Create text overlays
        const textContainer = document.createElement('div');
        textContainer.className = 'text-overlay-container';
        textContainer.style.position = 'absolute';
        textContainer.style.top = '20px';
        textContainer.style.left = '20px';
        textContainer.style.zIndex = '20';
        textContainer.style.pointerEvents = 'none';
        
        // Create headline
        const headline = document.createElement('div');
        headline.className = 'text-overlay headline';
        headline.textContent = chosenCopy.headline;
        headline.style.fontSize = '34px';
        headline.style.fontWeight = '700';
        headline.style.lineHeight = '1.2';
        headline.style.marginBottom = '8px';
        headline.style.fontFamily = 'Roboto, sans-serif';
        
        // Create subhead
        const subhead = document.createElement('div');
        subhead.className = 'text-overlay subhead';
        subhead.textContent = chosenCopy.subhead;
        subhead.style.fontSize = '16px';
        subhead.style.fontWeight = '400';
        subhead.style.lineHeight = '1.4';
        subhead.style.fontFamily = 'Roboto, sans-serif';
        
        // Run ADA compliance checks and set text colors
        const warnings = [];
        const textColor = await determineTextColor(textContainer);
        
        // Apply text color
        headline.style.color = textColor;
        subhead.style.color = textColor;
        
        if (textColor === 'white') {
            headline.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
            subhead.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
        } else {
            headline.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.5)';
            subhead.style.textShadow = '1px 1px 2px rgba(255, 255, 255, 0.5)';
        }
        
        // Check font sizes (ADA compliance)
        const headlineSize = parseInt(headline.style.fontSize);
        const subheadSize = parseInt(subhead.style.fontSize);
        
        if (headlineSize < 34) {
            warnings.push(`Headline font size (${headlineSize}px) is below recommended 34px`);
        }
        
        if (subheadSize < 16) {
            warnings.push(`Subhead font size (${subheadSize}px) is below recommended 16px`);
        }
        
        // Add elements to container
        textContainer.appendChild(headline);
        textContainer.appendChild(subhead);
        
        // Add to preview content
        previewContent.appendChild(textContainer);
        
        // Show warnings if any
        if (warnings.length > 0) {
            showAdaWarnings(warnings);
        }
    }
    
    function removeTextOverlays() {
        const existingOverlays = previewContent.querySelectorAll('.text-overlay-container');
        existingOverlays.forEach(overlay => overlay.remove());
        
        // Also remove background overlays
        const existingBgOverlays = previewContent.querySelectorAll('.text-background-overlay');
        existingBgOverlays.forEach(overlay => overlay.remove());
    }
    
    async function determineTextColor(textElement) {
        // Get background color at text position
        const backgroundColor = getBackgroundColorAtPosition(20, 20); // Text position
        
        // Use the new WCAG utility to get the best text color
        const result = getBestTextColor(backgroundColor, 4.5);
        
        // Handle warnings and background adjustments
        const warnings = [];
        
        if (result.adjusted) {
            warnings.push(`Original contrast ratio (${result.originalRatio.toFixed(1)}:1) was below WCAG AA standard (4.5:1). Background adjusted to achieve ${result.ratio.toFixed(1)}:1 contrast.`);
            
            // Apply background adjustment by adding a semi-transparent overlay
            addBackgroundOverlay(result.adjustedBackground);
        } else if (result.ratio < 4.5) {
            warnings.push(`Text contrast ratio (${result.ratio.toFixed(1)}:1) is below WCAG AA standard (4.5:1). Using best available color.`);
        }
        
        if (warnings.length > 0) {
            showAdaWarnings(warnings);
        }
        
        return result.color === '#ffffff' ? 'white' : 'black';
    }
    
    function addBackgroundOverlay(adjustedBackgroundColor) {
        // Add a semi-transparent overlay behind the text to improve contrast
        const overlay = document.createElement('div');
        overlay.className = 'text-background-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '15px';
        overlay.style.left = '15px';
        overlay.style.right = '15px';
        overlay.style.height = '80px';
        overlay.style.backgroundColor = adjustedBackgroundColor;
        overlay.style.opacity = '0.8';
        overlay.style.borderRadius = '8px';
        overlay.style.zIndex = '19';
        overlay.style.pointerEvents = 'none';
        
        previewContent.appendChild(overlay);
    }
    
    function getBackgroundColorAtPosition(x, y) {
        // Return proper hex colors based on the current style and fidelity
        if (adStyle === 'studio') {
            return fidelity === 'high' ? '#f1f3f4' : '#f8f9fa'; // Slightly different shades for fidelity
        } else if (adStyle === 'nature') {
            return fidelity === 'high' ? '#e0f2e0' : '#e8f5e8'; // Slightly different green shades
        }
        return '#ecf0f1'; // Default neutral background
    }
    
    // WCAG Contrast Ratio Utility
    function hexToRgb(hex) {
        // Convert hex color to RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    function getRelativeLuminance(rgb) {
        // Calculate relative luminance according to WCAG 2.1
        const { r, g, b } = rgb;
        
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }
    
    function calculateContrast(color1, color2) {
        // Calculate WCAG contrast ratio between two colors
        const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
        const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
        
        if (!rgb1 || !rgb2) return 1; // Fallback
        
        const lum1 = getRelativeLuminance(rgb1);
        const lum2 = getRelativeLuminance(rgb2);
        
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
    
    function getBestTextColor(backgroundColor, targetRatio = 4.5) {
        // Get the best text color (black or white) for the given background
        const bgRgb = hexToRgb(backgroundColor);
        if (!bgRgb) return { color: '#000000', ratio: 1, adjusted: false };
        
        const whiteRgb = { r: 255, g: 255, b: 255 };
        const blackRgb = { r: 0, g: 0, b: 0 };
        
        const whiteContrast = calculateContrast(whiteRgb, bgRgb);
        const blackContrast = calculateContrast(blackRgb, bgRgb);
        
        // Check if either color meets the target ratio
        if (whiteContrast >= targetRatio && whiteContrast >= blackContrast) {
            return { color: '#ffffff', ratio: whiteContrast, adjusted: false };
        } else if (blackContrast >= targetRatio) {
            return { color: '#000000', ratio: blackContrast, adjusted: false };
        }
        
        // Neither meets the requirement - adjust background
        const preferWhite = whiteContrast > blackContrast;
        const adjustedBg = adjustBackgroundForContrast(backgroundColor, preferWhite ? '#ffffff' : '#000000', targetRatio);
        
        return {
            color: preferWhite ? '#ffffff' : '#000000',
            ratio: adjustedBg.ratio,
            adjusted: true,
            adjustedBackground: adjustedBg.color,
            originalRatio: Math.max(whiteContrast, blackContrast)
        };
    }
    
    function adjustBackgroundForContrast(backgroundColor, textColor, targetRatio = 4.5) {
        // Adjust background color to meet contrast requirements
        const bgRgb = hexToRgb(backgroundColor);
        const textRgb = hexToRgb(textColor);
        
        if (!bgRgb || !textRgb) return { color: backgroundColor, ratio: 1 };
        
        const textLuminance = getRelativeLuminance(textRgb);
        const isTextLight = textLuminance > 0.5;
        
        // Calculate target luminance for background
        let targetLuminance;
        if (isTextLight) {
            // Text is light (white), background needs to be darker
            targetLuminance = (textLuminance + 0.05) / targetRatio - 0.05;
        } else {
            // Text is dark (black), background needs to be lighter
            targetLuminance = targetRatio * (textLuminance + 0.05) - 0.05;
        }
        
        // Clamp luminance to valid range
        targetLuminance = Math.max(0, Math.min(1, targetLuminance));
        
        // Adjust RGB values to achieve target luminance
        const adjustedRgb = adjustRgbToLuminance(bgRgb, targetLuminance);
        const adjustedHex = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
        const finalRatio = calculateContrast(textRgb, adjustedRgb);
        
        return { color: adjustedHex, ratio: finalRatio };
    }
    
    function adjustRgbToLuminance(rgb, targetLuminance) {
        // Adjust RGB values to achieve target relative luminance
        const { r, g, b } = rgb;
        
        // Simple approach: adjust brightness while maintaining hue
        const currentLuminance = getRelativeLuminance(rgb);
        const ratio = Math.sqrt(targetLuminance / Math.max(currentLuminance, 0.001));
        
        const adjustedR = Math.round(Math.min(255, Math.max(0, r * ratio)));
        const adjustedG = Math.round(Math.min(255, Math.max(0, g * ratio)));
        const adjustedB = Math.round(Math.min(255, Math.max(0, b * ratio)));
        
        return { r: adjustedR, g: adjustedG, b: adjustedB };
    }
    
    function getSafeBackgroundColor() {
        // Return a safe background color based on style
        if (adStyle === 'studio') {
            return '#f8f9fa'; // Light gray
        } else if (adStyle === 'nature') {
            return '#e8f5e8'; // Light green
        }
        return '#ecf0f1'; // Default
    }
    
    function showAdaWarnings(warnings) {
        warningsList.innerHTML = '';
        warnings.forEach(warning => {
            const li = document.createElement('li');
            li.textContent = warning;
            warningsList.appendChild(li);
        });
        adaWarnings.style.display = 'block';
    }
    
    function downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
