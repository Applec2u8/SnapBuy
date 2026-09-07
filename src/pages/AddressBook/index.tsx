import { Loader2 } from 'lucide-react';
import { useAddressBook } from './hooks/useAddressBook';
import { AddressHeader } from './components/AddressHeader';
import { AddressCard } from './components/AddressCard';
import { AddressModal } from './components/AddressModal';
import { EmptyAddress } from './components/EmptyAddress';

const AddressBook = () => {
  const {
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
  } = useAddressBook();

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 animate-fade-in pb-20 text-left">
      <AddressHeader onAdd={() => handleOpenModal()} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {addresses.length > 0 ? (
          addresses.map((addr) => (
            <AddressCard 
              key={addr.id}
              address={addr}
              onEdit={handleOpenModal}
              onSetDefault={setDefault}
              onDelete={deleteAddress}
            />
          ))
        ) : (
          <EmptyAddress onAdd={() => handleOpenModal()} />
        )}
      </div>

      <AddressModal 
        show={showModal}
        onClose={() => setShowModal(false)}
        editingAddress={editingAddress}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        processing={processing}
      />
    </div>
  );
};

export default AddressBook;
