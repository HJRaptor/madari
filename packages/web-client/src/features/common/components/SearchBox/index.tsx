import { useStyletron } from 'baseui';
import { useIntl } from 'react-intl';
import { Button } from 'baseui/button';
import xCircle from '@/icons/x-mark.svg';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchHistory } from '@/features/common/hooks/use-search-history';
import { Search } from 'baseui/icon';
import { Input } from 'baseui/input';
import { Trash2, X } from 'lucide-react';
import { StyleObject } from 'styletron-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface SearchBoxProps {
  isActive: boolean;
  onClose: () => void;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'suggestion';
}

// Memoized suggestion item component
const SuggestionItem = memo(
  ({
    suggestion,
    isSelected,
    onSelect,
    onMouseEnter,
    onRemove,
  }: {
    suggestion: SearchSuggestion;
    isSelected: boolean;
    onSelect: () => void;
    onMouseEnter: () => void;
    onRemove: (e: React.MouseEvent) => void;
  }) => {
    const [css, theme] = useStyletron();

    const baseStyles = {
      padding: '8px 16px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      ':hover': {
        backgroundColor: theme.colors.backgroundSecondary,
      },
    };

    const selectedStyles = {
      ...baseStyles,
      backgroundColor: theme.colors.backgroundTertiary,
    };

    return (
      <li
        role="option"
        aria-selected={isSelected}
        className={css(isSelected ? selectedStyles : baseStyles)}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            marginRight: '8px',
          })}
        >
          {suggestion.type === 'history' && <Search size={16} />}
          <span
            className={css({
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            })}
          >
            {suggestion.text}
          </span>
        </div>
        <button
          onClick={onRemove}
          className={css({
            background: 'transparent',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.colors.contentSecondary,
            ':hover': {
              color: theme.colors.contentPrimary,
            },
          })}
          aria-label={`Remove ${suggestion.text} from history`}
        >
          <X size={16} />
        </button>
      </li>
    );
  },
);

SuggestionItem.displayName = 'SuggestionItem';

const ClearHistoryButton = memo(({ onClick }: { onClick: () => void }) => {
  const [css, theme] = useStyletron();
  const intl = useIntl();

  return (
    <button
      onClick={onClick}
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        ...theme.typography.LabelXSmall,
        width: '100%',
        border: 'none',
        borderTop: `1px solid ${theme.colors.borderOpaque}`,
        background: theme.colors.backgroundPrimary,
        color: theme.colors.primaryA,
        cursor: 'pointer',
        ':hover': {
          backgroundColor: theme.colors.backgroundSecondary,
        },
      })}
      aria-label={intl.formatMessage({
        defaultMessage: 'Clear search history',
      })}
    >
      <Trash2 size={14} />
      <span
        className={css({
          display: 'block',
        })}
      >
        {intl.formatMessage({
          defaultMessage: 'Clear history',
        })}
      </span>
    </button>
  );
});

ClearHistoryButton.displayName = 'ClearHistoryButton';

export default function SearchBox(props: SearchBoxProps) {
  const [css, theme] = useStyletron();
  const intl = useIntl();
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Memoize suggestions filtering
  const suggestions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      return searchHistory
        .map((item, index) => ({
          id: `history-${index}`,
          text: item,
          type: 'history' as const,
        }))
        .slice(0, 10);
    }

    return searchHistory
      .filter((item) => item.toLowerCase().includes(term))
      .map((item, index) => ({
        id: `history-${index}`,
        text: item,
        type: 'history' as const,
      }))
      .slice(0, 10);
  }, [searchTerm, searchHistory]);

  const [, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  // Memoize search handler
  const handleSearch = useCallback(() => {
    const termToSearch =
      selectedIndex >= 0 ? suggestions[selectedIndex].text : searchTerm.trim();
    if (termToSearch) {
      addToHistory(termToSearch);
      setIsOpen(false);
      setSearchTerm(termToSearch);

      navigate(`/search?q=${termToSearch}`);
    }
  }, [selectedIndex, suggestions, searchTerm, addToHistory, setSearchParams]);

  // Handle item removal
  const handleRemoveItem = useCallback(
    (e: React.MouseEvent, text: string) => {
      e.stopPropagation(); // Prevent suggestion selection
      removeFromHistory(text);
      // If no more suggestions, close dropdown
      if (suggestions.length <= 1) {
        setIsOpen(false);
      }
    },
    [removeFromHistory, suggestions.length],
  );

  // Handle clear all
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setIsOpen(false);
  }, [clearHistory]);

  // Memoize keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          handleSearch();
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [suggestions.length, handleSearch],
  );

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus management
  useEffect(() => {
    if (props.isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      inputRef.current?.focus();
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [props.isActive]);

  const dropdownStyles: StyleObject = useMemo(
    () => ({
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.backgroundPrimary,
      boxShadow: theme.lighting.shadow600,
      borderRadius: '4px',
      marginTop: '4px',
      maxHeight: '300px',
      overflowY: 'auto' as const,
      zIndex: 1000,
    }),
    [theme],
  );

  const listStyles: StyleObject = useMemo(
    () => ({
      margin: 0,
      padding: 0,
      listStyle: 'none',
    }),
    [],
  );

  return (
    <div
      className={css({
        height: '96px',
        background: theme.colors.backgroundPrimary,
        boxShadow: theme.lighting.shadow500,
        borderRadius: '0 0 12px 12px',
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 10,
        alignItems: 'center',
        placeContent: 'center',
        transform: props.isActive ? 'translateY(0)' : 'translateY(-110%)',
        transitionProperty: 'transform',
        transitionTimingFunction: 'ease',
        transitionDuration: '100ms',
      })}
    >
      <div
        className={css({
          display: 'flex',
          maxWidth: '1100px',
          margin: '0 auto',
          gap: '12px',
          padding: '0 16px',
          position: 'relative',
        })}
      >
        <div
          className={css({
            width: '100%',
            position: 'relative',
          })}
        >
          <Input
            inputRef={inputRef}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true);
            }}
            type="search"
            disabled={!props.isActive}
            placeholder={intl.formatMessage({
              defaultMessage: 'Search',
            })}
            aria-expanded={isOpen}
            aria-controls="search-suggestions"
            aria-activedescendant={
              selectedIndex >= 0 ? suggestions[selectedIndex]?.id : undefined
            }
            role="combobox"
            aria-autocomplete="list"
          />

          {isOpen && suggestions.length > 0 && props.isActive && (
            <div
              ref={dropdownRef}
              id="search-suggestions"
              className={css(dropdownStyles)}
            >
              <ul
                role="listbox"
                aria-label={intl.formatMessage({
                  defaultMessage: 'Search suggestions',
                })}
                className={css(listStyles)}
              >
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    isSelected={index === selectedIndex}
                    onSelect={() => {
                      setSearchTerm(suggestion.text);
                      setSelectedIndex(index);
                      handleSearch();
                    }}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                    }}
                    onRemove={(e) => {
                      handleRemoveItem(e, suggestion.text);
                    }}
                  />
                ))}
              </ul>
              <ClearHistoryButton onClick={handleClearHistory} />
            </div>
          )}
        </div>

        <Button
          overrides={{
            BaseButton: {
              style: {
                flexShrink: 0,
              },
            },
          }}
          shape="circle"
          disabled={!props.isActive}
          kind="primary"
          onClick={handleSearch}
          aria-label={intl.formatMessage({
            defaultMessage: 'Search',
          })}
        >
          <Search size={24} />
        </Button>

        <Button
          shape="circle"
          disabled={!props.isActive}
          overrides={{
            BaseButton: {
              style: {
                flexShrink: 0,
              },
            },
          }}
          kind="primary"
          onClick={props.onClose}
          aria-label={intl.formatMessage({
            defaultMessage: 'Close search',
          })}
        >
          <img width="24" height="24" src={xCircle} alt="" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
