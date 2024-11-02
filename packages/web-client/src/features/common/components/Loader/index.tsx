import {
  ALIGN,
  HeaderNavigation,
  StyledNavigationItem,
  StyledNavigationList,
} from 'baseui/header-navigation';
import { Block } from 'baseui/block';
import { Skeleton } from 'baseui/skeleton';
import { styled } from 'baseui';

const NavContainer = styled('div', {
  position: 'fixed',
  width: '100%',
  top: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  zIndex: 1000,
  padding: '12px 24px',
});

const AppSkeleton = () => {
  return (
    <Block backgroundColor="black" height="100vh" overflow="auto">
      {/* Navigation Skeleton */}
      <NavContainer>
        <HeaderNavigation
          overrides={{
            Root: {
              style: {
                backgroundColor: 'transparent',
              },
            },
          }}
        >
          <StyledNavigationList $align={ALIGN.left}>
            <StyledNavigationItem>
              <Skeleton
                animation
                height="32px"
                width="32px"
                overrides={{
                  Root: {
                    style: {
                      backgroundColor: '#333',
                      borderRadius: '50%',
                    },
                  },
                }}
              />
            </StyledNavigationItem>
          </StyledNavigationList>

          <StyledNavigationList $align={ALIGN.center}>
            {[1, 2, 3].map((item) => (
              <StyledNavigationItem key={item}>
                <Skeleton
                  animation
                  height="36px"
                  width="100px"
                  overrides={{
                    Root: {
                      style: {
                        backgroundColor: '#333',
                        borderRadius: '20px',
                        marginLeft: '8px',
                      },
                    },
                  }}
                />
              </StyledNavigationItem>
            ))}
          </StyledNavigationList>

          <StyledNavigationList $align={ALIGN.right}>
            <StyledNavigationItem>
              <Skeleton
                animation
                height="36px"
                width="100px"
                overrides={{
                  Root: {
                    style: {
                      backgroundColor: '#333',
                      borderRadius: '20px',
                    },
                  },
                }}
              />
            </StyledNavigationItem>
          </StyledNavigationList>
        </HeaderNavigation>
      </NavContainer>

      {/* Popular Movies Section */}
      <Block padding="0 60px" marginBottom="40px">
        <Skeleton
          animation
          height="32px"
          width="200px"
          overrides={{
            Root: {
              style: {
                backgroundColor: '#333',
                marginBottom: '16px',
              },
            },
          }}
        />

        <Block
          display="flex"
          overrides={{
            Block: {
              style: { gap: '16px' },
            },
          }}
        >
          {Array.from({ length: 10 }).map((_, item) => (
            <Skeleton
              key={item}
              animation
              height="300px"
              width="200px"
              overrides={{
                Root: {
                  style: {
                    backgroundColor: '#333',
                    borderRadius: '4px',
                  },
                },
              }}
            />
          ))}
        </Block>
      </Block>
    </Block>
  );
};

export default AppSkeleton;
