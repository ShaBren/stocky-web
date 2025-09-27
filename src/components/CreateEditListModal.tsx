import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateShoppingList, useUpdateShoppingList } from '../hooks/useShoppingLists';
import type { ShoppingListFormData, ShoppingListSummary } from '../types/shoppingLists';

interface CreateEditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingList?: ShoppingListSummary;
}

export function CreateEditListModal({ isOpen, onClose, editingList }: CreateEditListModalProps) {
  const isEditing = !!editingList;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useCreateShoppingList();
  const updateMutation = useUpdateShoppingList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ShoppingListFormData>({
    defaultValues: {
      name: editingList?.name || '',
      is_public: editingList?.is_public || false,
    }
  });

  const onSubmit = async (data: ShoppingListFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && editingList) {
        await updateMutation.mutateAsync({
          listId: editingList.id,
          data: {
            name: data.name,
            is_public: data.is_public,
          }
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          is_public: data.is_public,
        });
      }
      handleClose();
    } catch (error) {
      console.error('Failed to save shopping list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={isSubmitting ? () => {} : handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {isEditing ? 'Edit Shopping List' : 'Create Shopping List'}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                          List Name
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            id="name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="Enter list name..."
                            {...register('name', {
                              required: 'List name is required',
                              minLength: {
                                value: 1,
                                message: 'List name must be at least 1 character'
                              },
                              maxLength: {
                                value: 255,
                                message: 'List name must be less than 255 characters'
                              }
                            })}
                          />
                          {errors.name && (
                            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Visibility
                        </label>
                        <div className="mt-3 space-y-3">
                          <div className="flex items-start">
                            <div className="flex h-6 items-center">
                              <input
                                id="private"
                                type="radio"
                                value="false"
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                                {...register('is_public')}
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor="private" className="font-medium text-gray-900">
                                Private
                              </label>
                              <p className="text-gray-500">Only you can see and edit this list</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="flex h-6 items-center">
                              <input
                                id="public"
                                type="radio"
                                value="true"
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                                {...register('is_public')}
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor="public" className="font-medium text-gray-900">
                                Public
                              </label>
                              <p className="text-gray-500">Everyone can see and edit this list</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {isEditing ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            isEditing ? 'Update List' : 'Create List'
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={handleClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}