import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { itemsAPI } from '../services/api';
import { useAddItemToShoppingList } from '../hooks/useShoppingLists';
import type { Item } from '../types/api';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
}

interface AddItemForm {
  itemId: number;
  quantity: number;
}

export function AddItemModal({ isOpen, onClose, listId }: AddItemModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItemMutation = useAddItemToShoppingList();

  // Fetch items for selection
  const { data: itemsResponse, isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', 'search', searchTerm],
    queryFn: () => itemsAPI.getItems({ 
      search: searchTerm || undefined,
      size: 20 
    }),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AddItemForm>({
    defaultValues: {
      quantity: 1,
    }
  });



  useEffect(() => {
    if (selectedItem) {
      setValue('itemId', selectedItem.id);
    }
  }, [selectedItem, setValue]);

  const onSubmit = async (data: AddItemForm) => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await addItemMutation.mutateAsync({
        listId: parseInt(listId),
        itemData: {
          item_id: data.itemId,
          quantity: data.quantity,
        }
      });
      handleClose();
    } catch (error) {
      console.error('Failed to add item to shopping list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedItem(null);
    setSearchTerm('');
    onClose();
  };

  const filteredItems = itemsResponse || [];

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
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
                      Add Item to Shopping List
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                      {/* Item Selection */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium leading-6 text-gray-900">
                            Search and Select Item
                          </label>
                          <div className="mt-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="Search items by name or barcode..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Selected Item Display */}
                        {selectedItem && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-blue-900">{selectedItem.name}</h4>
                                <p className="text-sm text-blue-700">
                                  {selectedItem.description} {selectedItem.upc && `• UPC: ${selectedItem.upc}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Item List */}
                        {!selectedItem && (
                          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                            {isLoadingItems ? (
                              <div className="p-4 text-center text-gray-500">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2">Searching items...</p>
                              </div>
                            ) : filteredItems.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                {searchTerm ? 'No items found matching your search.' : 'Start typing to search for items.'}
                              </div>
                            ) : (
                              <div className="divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedItem(item)}
                                    className="w-full text-left p-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-500">
                                          {item.description} {item.upc && `• UPC: ${item.upc}`}
                                        </p>
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {item.default_storage_type || 'No storage type'}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quantity */}
                        {selectedItem && (
                          <div>
                            <label htmlFor="quantity" className="block text-sm font-medium leading-6 text-gray-900">
                              Quantity
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                id="quantity"
                                min="1"
                                step="1"
                                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                {...register('quantity', {
                                  required: 'Quantity is required',
                                  min: { value: 1, message: 'Quantity must be at least 1' },
                                  valueAsNumber: true
                                })}
                              />
                              {errors.quantity && (
                                <p className="mt-2 text-sm text-red-600">{errors.quantity.message}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={!selectedItem || isSubmitting}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            'Add Item'
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