import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';

export const useAddressBook = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    address_line: '',
    is_default: false
  });

  useEffect(() => {
    if (user) fetchAddresses();

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address: any = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        full_name: address.full_name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        postal_code: address.postal_code,
        address_line: address.address_line,
        is_default: address.is_default
      });
    } else {
      setEditingAddress(null);
      setFormData({
        full_name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        postal_code: '',
        address_line: '',
        is_default: false
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('user_addresses')
          .update(formData)
          .eq('id', editingAddress.id);
        if (error) throw error;
        toast.success('Address updated!');
      } else {
        const { error } = await supabase
          .from('user_addresses')
          .insert([{ ...formData, user_id: user?.id }]);
        if (error) throw error;
        toast.success('Address added!');
      }
      setShowModal(false);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const { error } = await supabase.from('user_addresses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Address deleted');
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user?.id);
      const { error } = await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
      if (error) throw error;
      fetchAddresses();
      toast.success('Default address updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return {
    addresses,
    loading,
    showModal,
    setShowModal,
    editingAddress,
    processing,
    formData,
    setFormData,
    handleOpenModal,
    handleSubmit,
    deleteAddress,
    setDefault
  };
};
