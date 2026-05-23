import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ACCEPTED_TYPES, MAX_FILE_SIZE, calculatePrintTotal,
  getPriceFromList, DEFAULT_PRICING,
} from './printPricing';
import { PDFDocument } from 'pdf-lib';

const STEPS = ['upload', 'settings', 'review', 'pay'];

export function usePrintFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const savedForm = JSON.parse(localStorage.getItem('diamond_customer') || '{}');
  const [customerName, setCustomerName] = useState(savedForm.name || '');
  const [customerPhone, setCustomerPhone] = useState(savedForm.phone || '');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    colour_mode: 'bw',
    sides: 'single',
    paper_size: 'a4',
    copies: 1,
    page_count: 1,
    notes: '',
    binding: 'long',
  });
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const pricePerPage = getPriceFromList(pricing, printSettings.colour_mode, printSettings.sides, printSettings.paper_size) || 2;
  const calculatedPrice = calculatePrintTotal(pricePerPage, printSettings.page_count, printSettings.copies, printSettings.sides);
  const [jobId, setJobId] = useState(null);
  const [pickupCode, setPickupCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [jobStatus, setJobStatus] = useState('PENDING_PAYMENT');
  const [completedJob, setCompletedJob] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    supabase.from('print_pricing').select('*').eq('is_active', true).then(({ data }) => {
      if (data?.length) setPricing(data);
    });
  }, []);



  const detectPageCount = async (file, fileType) => {
    if (fileType === 'image') return 1;
    if (fileType === 'docx') return 1;
    if (fileType === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: true 
        });
        return pdf.getPageCount();
      } catch {
        return 1;
      }
    }
    return 1;
  };

  const handleFileSelect = useCallback(async (file) => {
    setUploadError('');
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 25MB.');
      return;
    }
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const mimeType = ACCEPTED_TYPES[file.type] ? file.type : null;
  const fileType = mimeType ? ACCEPTED_TYPES[mimeType] :
      (ext === '.pdf' ? 'pdf' : ext === '.docx' ? 'docx' :
        ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? 'image' : null);
    if (!fileType) {
      setUploadError('Unsupported format. Please use PDF, DOCX, JPG or PNG.');
      return;
    }

    const uploadId = crypto.randomUUID();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `incoming/${uploadId}/${sanitized}`;

    setIsUploading(true);
    setUploadProgress(0);

    const pageCount = await detectPageCount(file, fileType);
    if (pageCount >= 200) {
      setUploadError('Large document detected (200+ pages). This may take several minutes to print.');
    }

    const { error } = await supabase.storage
      .from('print-files')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    setIsUploading(false);

    if (error) {
      setUploadError(error.message.includes('Bucket') ?
        'Service temporarily unavailable. Please try again.' :
        `Upload failed: ${error.message}. Please retry.`);
      return;
    }

    setUploadedFile(file);
    setFileMetadata({ path: storagePath, name: file.name, size: file.size, type: fileType });
    setPrintSettings(prev => ({ ...prev, page_count: pageCount }));
    setUploadProgress(100);
  }, []);

  const validateUploadStep = () => {
    const errs = {};
    if (!fileMetadata) errs.file = 'Please upload a file';
    if (!customerName.trim() || customerName.trim().length < 2) errs.name = 'Name required (min 2 chars)';
    if (!/^\d{10}$/.test(customerPhone)) errs.phone = 'Valid 10-digit phone required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 0 && !validateUploadStep()) return;
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileMetadata(null);
    setUploadProgress(0);
    setUploadError('');
  };

  const createJobAndPay = async () => {
    setPaymentStatus('creating');
    let finalNotes = printSettings.notes || '';
    if (printSettings.sides === 'double') {
      const bindingInfo = `Binding: ${printSettings.binding === 'short' ? 'Short Edge (Calendar)' : 'Long Edge (Book)'}`;
      finalNotes = finalNotes ? `${bindingInfo}\n${finalNotes}` : bindingInfo;
    }

    const { data, error } = await supabase.functions.invoke('create-print-job', {
      body: {
        customer_name: customerName.trim(),
        customer_phone: customerPhone,
        file_path: fileMetadata.path,
        file_name: fileMetadata.name,
        file_type: fileMetadata.type,
        page_count: printSettings.page_count,
        copies: printSettings.copies,
        colour_mode: printSettings.colour_mode,
        sides: printSettings.sides,
        paper_size: printSettings.paper_size,
        notes: finalNotes || null,
      },
    });

    if (error || data?.error) {
      setPaymentStatus('error');
      throw new Error(data?.error || error?.message || 'Failed to create print job');
    }

    const currentForm = JSON.parse(localStorage.getItem('diamond_customer') || '{}');
    localStorage.setItem('diamond_customer', JSON.stringify({ ...currentForm, name: customerName.trim(), phone: customerPhone }));

    setJobId(data.job_id);
    setPickupCode(data.pickup_code);
    setPaymentStatus('paying');

    await loadRazorpay();
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: data.razorpay_key_id,
        amount: data.amount_paise,
        currency: 'INR',
        name: 'Diamond Chemist',
        description: `Print Job - ${printSettings.page_count} pages`,
        order_id: data.razorpay_order_id,
        prefill: { name: customerName, contact: customerPhone },
        theme: { color: '#1A4F9C' },
        handler: async (response) => {
          setPaymentStatus('verifying');
          const { data: verifyData, error: verifyErr } = await supabase.functions.invoke('verify-print-payment', {
            body: {
              job_id: data.job_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });
          if (verifyErr || verifyData?.error) {
            setPaymentStatus('verify_failed');
            reject(new Error(verifyData?.error || 'Payment verification failed'));
            return;
          }
          setPaymentStatus('success');
          setJobStatus('PAID');
          const completed = {
            id: data.job_id,
            pickup_code: data.pickup_code,
            total_amount: data.total_amount,
            ...printSettings,
            file_name: fileMetadata.name,
            customer_name: customerName,
            customer_phone: customerPhone,
          };
          setCompletedJob(completed);
          sessionStorage.setItem('print_job_success', JSON.stringify(completed));
          resolve(data);
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('cancelled');
            reject(new Error('cancelled'));
          },
        },
      });
      rzp.open();
    });
  };

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return {
    currentStep, setCurrentStep, steps: STEPS,
    customerName, setCustomerName, customerPhone, setCustomerPhone,
    uploadedFile, fileMetadata, uploadProgress, uploadError, isUploading,
    handleFileSelect, removeFile, printSettings, setPrintSettings,
    calculatedPrice, pricePerPage, pricing,
    jobId, pickupCode, paymentStatus, jobStatus, setJobStatus,
    completedJob, formErrors, nextStep, prevStep, createJobAndPay,
  };
}
