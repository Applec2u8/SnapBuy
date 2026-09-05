import { useProfileEdit } from './hooks/useProfileEdit';
import { ProfileEditHeader } from './components/ProfileEditHeader';
import { AvatarSection } from './components/AvatarSection';
import { ProfileForm } from './components/ProfileForm';

const ProfileEdit = () => {
  const {
    user,
    loading,
    uploading,
    formData,
    fileInputRef,
    handleInputChange,
    handleAvatarClick,
    handleFileChange,
    handleSubmit,
    shop
  } = useProfileEdit();

  return (
    <div className="max-w-5xl mx-auto min-h-screen px-4 pb-32 animate-fade-in">
      <div className="pt-8 space-y-8">
        <ProfileEditHeader 
          loading={loading}
          uploading={uploading}
          handleSubmit={handleSubmit}
          shop={shop}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <AvatarSection 
            uploading={uploading}
            avatarUrl={formData.avatarUrl}
            firstName={formData.firstName}
            email={user?.email || ''}
            handleAvatarClick={handleAvatarClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
          />

          <ProfileForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            loading={loading}
            uploading={uploading}
            userEmail={user?.email || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
