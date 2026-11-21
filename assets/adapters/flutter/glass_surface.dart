import 'dart:ui' as ui;
import 'package:flutter/material.dart';

/// Clipped, theme-aware frost. This is a blur material, not a refraction shader.
/// Supply an opaque [solidColor] appropriate for the app's text colors.
class GlassSurface extends StatelessWidget {
  const GlassSurface({
    super.key,
    required this.child,
    this.radius = 24,
    this.blur = 18,
    this.padding = const EdgeInsets.all(20),
    this.reduceTransparency = false,
    this.tint,
    this.solidColor,
  }) : assert(radius >= 0), assert(blur >= 0);

  final Widget child;
  final double radius;
  final double blur;
  final EdgeInsetsGeometry padding;
  final bool reduceTransparency;
  final Color? tint;
  final Color? solidColor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dark = theme.brightness == Brightness.dark;
    final solid = solidColor ?? theme.colorScheme.surface;
    final opaque = reduceTransparency || MediaQuery.of(context).highContrast;
    final surface = opaque
        ? solid
        : tint ?? (dark ? const Color(0xA329283E) : const Color(0xB8FFFFFF));
    final borderRadius = BorderRadius.circular(radius);
    final content = DecoratedBox(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: borderRadius,
        border: Border.all(
          color: opaque
              ? theme.colorScheme.outline
              : (dark ? const Color(0x55FFFFFF) : const Color(0xDDFFFFFF)),
        ),
      ),
      child: Padding(padding: padding, child: child),
    );
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        boxShadow: const [
          BoxShadow(color: Color(0x1F201A40), blurRadius: 28, offset: Offset(0, 10)),
        ],
      ),
      child: ClipRRect(
        borderRadius: borderRadius,
        child: opaque || blur == 0
            ? content
            : BackdropFilter(
                filter: ui.ImageFilter.blur(sigmaX: blur, sigmaY: blur),
                child: content,
              ),
      ),
    );
  }
}
