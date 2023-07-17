#import <React/RCTViewManager.h>

@interface RNTLaunchScreen : RCTViewManager
@end

@implementation RNTLaunchScreen

RCT_EXPORT_MODULE(RNTLaunchScreen)

- (UIView *)view
{
  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *controller = [storyboard instantiateInitialViewController];
  
  return controller.view;
}

@end
