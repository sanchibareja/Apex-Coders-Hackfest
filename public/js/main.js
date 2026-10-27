document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initDropzone();
  initSampleChips();
  initFormSubmitState();
});

//  MOBILE RESPONSIVE HAMBURGER MENU
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('mainNav');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggleBtn.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        toggleBtn.classList.remove('active');
      }
    });
  }
}

// 2. FILE UPLOAD & DROPZONE (MULTER FRONTEND)

function initDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('screenshot');
  const previewBox = document.getElementById('filePreviewContainer');
  const previewImg = document.getElementById('filePreviewImg');
  const fileNameEl = document.getElementById('fileName');
  const fileSizeEl = document.getElementById('fileSize');
  const removeBtn = document.getElementById('removeFileBtn');
  const dropzoneContent = document.querySelector('.dropzone-content');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      fileInput.files = files;
      handleFileSelected(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      clearFileSelection();
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected image exceeds the 10MB limit.');
      clearFileSelection();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      fileNameEl.textContent = file.name;
      fileSizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      
      if (dropzoneContent) dropzoneContent.style.display = 'none';
      if (previewBox) previewBox.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  function clearFileSelection() {
    fileInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewBox) previewBox.style.display = 'none';
    if (dropzoneContent) dropzoneContent.style.display = 'block';
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearFileSelection();
    });
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearFileSelection();
    });
  }
}

// 3. QUICK DEMO PRESET SAMPLES

function initSampleChips() {
  const chips = document.querySelectorAll('.chip[data-sample]');
  const headlineInput = document.getElementById('headlineText');
  const messageInput = document.getElementById('messageText');

  const samples = {
    'fake-payment': {
      headline: 'Customer Showing ₹3,500 Paytm Spoof Payment Screenshot with No Bank Credit',
      message: 'Payment Successful\nPaid to: Ramesh Electronic Store (shopkeeper)\nAmount: ₹3,500.00\nPayment Mode: Paytm Spoof Wallet\nTxn ID: 987654 (Notice: Missing 12-digit NPCI bank UTR number, no debited bank account confirmation from SBI/HDFC, customer demanding immediate item hand-over without bank SMS).'
    },
    'real-payment': {
      headline: 'Google Pay UPI Transfer of ₹1,200 with 12-Digit NPCI Reference',
      message: 'Paid to: Ramesh Electronic Store (ramesh@okaxis)\n₹1,200.00 completed\nUPI transaction ID: 429812938472\nTo: Ramesh Kumar\nFrom: Amit Singh (State Bank of India - ····4821)\nGoogle Transaction ID: CICAgODV_72hYw\nPayment status: Success.'
    },
    'real-news': {
      headline: 'ISRO Successfully Launches Earth Observation Satellite EOS-08 from Sriharikota',
      message: 'Press Information Bureau (PIB) Press Release: The Indian Space Research Organisation (ISRO) today successfully placed the Earth Observation Satellite EOS-08 into intended orbit from Satish Dhawan Space Centre, Sriharikota. The mission objective was achieved with all three payloads functioning nominally under Chairman S. Somanath.'
    },
    'free-recharge': {
      headline: 'Govt Free Rs 5000 3-Month Recharge Offer',
      message: '🚨 Breaking: Prime Minister Narendra Modi has announced a special digital gift of 3 months free recharge of Rs 5000 for all Jio, Airtel, and Vi users to celebrate 2026 digital milestones! Click this link to activate before midnight: http://pm-gift-recharge5000.tk and forward to 10 friends!'
    },
    'bank-kyc': {
      headline: 'Urgent SBI Bank Account Suspension Notice',
      message: 'Dear customer, your SBI NetBanking account will be blocked and frozen within 2 hours due to pending PAN Aadhaar KYC verification. Click http://sbi-kyc-verify-login.online to update your account immediately or visit nearest police station.'
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleKey = chip.getAttribute('data-sample');
      if (samples[sampleKey]) {
        if (headlineInput) headlineInput.value = samples[sampleKey].headline;
        if (messageInput) {
          messageInput.value = samples[sampleKey].message;
          messageInput.focus();
        }
      }
    });
  });
}


// 4. FORM SUBMIT & LOADING STATE

function initFormSubmitState() {
  const form = document.getElementById('verifyForm');
  const submitBtn = document.getElementById('submitBtn');
  const loadingIndicator = document.getElementById('loadingIndicator');

  if (form && submitBtn && loadingIndicator) {
    form.addEventListener('submit', () => {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>⏳</span><span>Analyzing with LLM...</span>";
      loadingIndicator.style.display = 'block';
      loadingIndicator.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
}


// 5. COPY WHATSAPP DEBUNK CARD TO CLIPBOARD

function copyWhatsAppDebunk() {
  const textEl = document.getElementById('whatsappDebunkText');
  const copyBtn = document.getElementById('copyWaBtn');
  const copyBtnText = document.getElementById('copyBtnText');

  if (!textEl) return;

  const textToCopy = textEl.textContent.trim();

  navigator.clipboard.writeText(textToCopy).then(() => {
    if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard! ✓';
    if (copyBtn) copyBtn.style.background = '#10b981';

    setTimeout(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copy 2-Sentence Debunk';
      if (copyBtn) copyBtn.style.background = '';
    }, 2500);
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (copyBtnText) copyBtnText.textContent = 'Copied! ✓';
    setTimeout(() => {
      if (copyBtnText) copyBtnText.textContent = 'Copy 2-Sentence Debunk';
    }, 2500);
  });
}

function copyFeedDebunk(buttonEl, text) {
  navigator.clipboard.writeText(text).then(() => {
    const originalHtml = buttonEl.innerHTML;
    buttonEl.innerHTML = <span>✓ Copied!</span>;
    buttonEl.style.background = 'rgba(37, 211, 102, 0.4)';

    setTimeout(() => {
      buttonEl.innerHTML = originalHtml;
      buttonEl.style.background = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}


// 6. COMMUNITY UPVOTE & DELETION (AJAX)

async function upvoteReport(reportId) {
  const btn = document.getElementById(`vote-btn-${reportId}`);
  const countSpan = document.getElementById(`vote-count-${reportId}`);

  if (!btn || btn.disabled) return;

  try {
    btn.disabled = true;
    const response = await fetch(`/api/report/${reportId}/upvote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      if (countSpan) countSpan.textContent = data.upvotes;
      btn.style.borderColor = '#10b981';
      btn.style.color = '#34d399';
      btn.title = 'You verified this scam report!';
    } else {
      btn.disabled = false;
    }
  } catch (err) {
    console.error('Upvote failed:', err);
    btn.disabled = false;
  }
}

async function deleteReport(reportId) {
  if (!confirm('Are you sure you want to remove this report as a moderator?')) {
    return;
  }

  try {
    const response = await fetch(`/api/report/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      const card = document.getElementById(`report-${reportId}`);
      if (card) {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => card.remove(), 400);
      }
    } else {
      alert(data.error || 'Failed to delete report.');
    }
  } catch (err) {
    alert('Error connecting to server.');
  }
}