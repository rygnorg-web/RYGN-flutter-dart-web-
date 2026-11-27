export const RYGN_HOME_PAGE_DART_CODE = `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

/// Rohingya Young Generation Network (RYGN) Mobile Home Page Widget
/// StatefulWidget named RYGNHomePage matching non-profit reference design.
///
/// TODO: Connect with Supabase database for dynamic policies, reports, hero image, and donations.
class RYGNHomePage extends StatefulWidget {
  final bool isAdmin;
  const RYGNHomePage({super.key, this.isAdmin = false});

  @override
  State<RYGNHomePage> createState() => _RYGNHomePageState();
}

class _RYGNHomePageState extends State<RYGNHomePage> {
  // Brand Color Constants
  static const Color yellowPrimary = Color(0xFFFFD600); // Yellow #FFD600
  static const Color topBarBlack = Color(0xFF1A1A1A);   // TopBar #1A1A1A
  static const Color contentBlack = Color(0xFF000000);  // Black #000000
  static const Color textGrey = Color(0xFF4A4A4A);      // Text grey #4A4A4A

  // State Variables
  bool _isAboutExpanded = false;
  double _fontSizeScale = 1.0;
  String _selectedCountry = 'Global (English)';
  final ImagePicker _imagePicker = ImagePicker();
  File? _customHeroImageFile;
  final String _publicHeroImageUrl = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac';

  // Supported Countries List
  final List<String> _supportedCountries = const [
    'Global (English)',
    'Rohingya (Ruáingga)',
    'Myanmar / Burma',
    'Bangladesh (Cox\'s Bazar)',
    'Malaysia (Kuala Lumpur)',
    'Indonesia',
    'Thailand',
    'India',
    'Pakistan',
    'Saudi Arabia',
    'United Arab Emirates (UAE)',
    'Turkey',
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Japan',
    'Germany',
    'Ireland',
    'Switzerland',
    'New Zealand',
  ];

  /// Admin-only: opens device gallery to replace the hero picture
  Future<void> _pickHeroImageFromGallery() async {
    if (!widget.isAdmin) return;
    final XFile? picked = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 88,
    );
    if (picked != null && mounted) {
      setState(() {
        _customHeroImageFile = File(picked.path);
      });
      // TODO: Upload picked image to Supabase Storage so all public users receive the updated URL.
    }
  }

  /// Opens PDF Activity Report in browser or viewer using url_launcher
  Future<void> _openReportPdf() async {
    final Uri pdfUri = Uri.parse('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    if (!await launchUrl(pdfUri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open PDF report link.')),
        );
      }
    }
  }

  /// Toggles font size for accessibility (A+ button)
  void _toggleAccessibilityFontSize() {
    setState(() {
      if (_fontSizeScale >= 1.2) {
        _fontSizeScale = 1.0;
      } else {
        _fontSizeScale = 1.15;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MediaQuery(
      data: MediaQuery.of(context).copyWith(
        textScaler: TextScaler.linear(_fontSizeScale),
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Column(
            children: [
              // 1. TOP ACCESSIBILITY BAR (Black #1A1A1A)
              _buildTopBar(),

              // 2. HEADER BAR (White)
              _buildHeader(),

              // MAIN SCROLLABLE CONTENT BODY
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 3. HERO IMAGE CONTAINER (Height 260, 8px rounded)
                      _buildHeroImage(),

                      const SizedBox(height: 24.0),

                      // 4. HEADING (Bold 32px Black)
                      _buildTitleSection(),

                      const SizedBox(height: 24.0),

                      // 5. ABOUT US BOX (Expandable with 1.5px Black Border)
                      _buildAboutUsBox(),

                      const SizedBox(height: 20.0),

                      // 6. CONTENT PARAGRAPH (Text grey #4A4A4A)
                      _buildContentParagraph(),

                      const SizedBox(height: 32.0),

                      // 7. POLICIES AND REPORTS SECTION
                      _buildPoliciesSection(),

                      const SizedBox(height: 40.0),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- 1. TOP BAR WIDGET (#1A1A1A) ---
  Widget _buildTopBar() {
    return Container(
      color: topBarBlack,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Country Selector Dropdown
          GestureDetector(
            onTap: _showCountryPicker,
            child: Row(
              children: [
                Text(
                  _selectedCountry,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12.0,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 4.0),
                const Icon(
                  Icons.arrow_drop_down,
                  color: Colors.white,
                  size: 18.0,
                ),
              ],
            ),
          ),

          // Right: Search Icon and A+ Button
          Row(
            children: [
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.search, color: Colors.white, size: 20.0),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Search activated')),
                  );
                },
              ),
              const SizedBox(width: 14.0),

              // A+ Accessibility Button
              GestureDetector(
                onTap: _toggleAccessibilityFontSize,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2A2A),
                    borderRadius: BorderRadius.circular(4.0),
                    border: Border.all(
                      color: _fontSizeScale > 1.0 ? yellowPrimary : Colors.transparent,
                      width: 1.0,
                    ),
                  ),
                  child: const Text(
                    'A+',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13.0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- 2. HEADER WIDGET ---
  Widget _buildHeader() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Official RYGN Logo (Register assets/images/IMG_20261118_211555.jpg in pubspec.yaml)
          Image.asset(
            'assets/images/IMG_20261118_211555.jpg',
            height: 44.0,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) {
              return Row(
                children: [
                  Container(
                    width: 32.0,
                    height: 32.0,
                    decoration: const BoxDecoration(
                      color: yellowPrimary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10.0),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text(
                        'ROHINGYA',
                        style: TextStyle(
                          color: contentBlack,
                          fontWeight: FontWeight.w900,
                          fontSize: 13.0,
                          letterSpacing: 0.5,
                          height: 1.0,
                        ),
                      ),
                      Text(
                        'YOUNG GENERATION NETWORK',
                        style: TextStyle(
                          color: Colors.black80,
                          fontWeight: FontWeight.bold,
                          fontSize: 7.5,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),

          // Center: Black DONATE Button with Yellow Heart
          ElevatedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Thank you for supporting RYGN youth programs!'),
                  backgroundColor: contentBlack,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: contentBlack,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24.0),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Text(
                  'DONATE',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12.0,
                    letterSpacing: 0.8,
                  ),
                ),
                SizedBox(width: 6.0),
                Icon(
                  Icons.favorite,
                  color: yellowPrimary,
                  size: 15.0,
                ),
              ],
            ),
          ),

          // Right: Hamburger Menu Icon
          IconButton(
            icon: const Icon(Icons.menu, color: contentBlack, size: 28.0),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Menu drawer opened')),
              );
            },
          ),
        ],
      ),
    );
  }

  // --- 3. HERO IMAGE WIDGET (Admin-only tap to open gallery; clean image with no dot or text) ---
  Widget _buildHeroImage() {
    return GestureDetector(
      onTap: widget.isAdmin ? _pickHeroImageFromGallery : null,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8.0),
        child: _customHeroImageFile != null
            ? Image.file(
                _customHeroImageFile!,
                height: 260.0,
                width: double.infinity,
                fit: BoxFit.cover,
              )
            : Image.network(
                _publicHeroImageUrl,
                height: 260.0,
                width: double.infinity,
                fit: BoxFit.cover,
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return Container(
                    height: 260.0,
                    color: const Color(0xFFF2F2F2),
                    child: const Center(
                      child: CircularProgressIndicator(color: yellowPrimary),
                    ),
                  );
                },
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 260.0,
                    decoration: BoxDecoration(
                      color: const Color(0xFF222222),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.people, color: yellowPrimary, size: 48.0),
                        SizedBox(height: 8.0),
                        Text(
                          'Rohingya Young Generation Community',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }

  // --- 4. HEADING (Bold 32px Black) ---
  Widget _buildTitleSection() {
    return const Text(
      'Our Organisation &\nGovernance',
      style: TextStyle(
        fontSize: 32.0,
        fontWeight: FontWeight.w900,
        color: contentBlack,
        height: 1.1,
        letterSpacing: -0.5,
      ),
    );
  }

  // --- 5. ABOUT US EXPANDABLE BOX (White with 1.5px Black Border) ---
  Widget _buildAboutUsBox() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4.0),
        border: Border.all(color: contentBlack, width: 1.5),
      ),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _isAboutExpanded = !_isAboutExpanded;
              });
            },
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'About Us',
                  style: TextStyle(
                    fontSize: 18.0,
                    fontWeight: FontWeight.bold,
                    color: contentBlack,
                  ),
                ),
                Icon(
                  _isAboutExpanded ? Icons.close : Icons.menu,
                  color: contentBlack,
                  size: 22.0,
                ),
              ],
            ),
          ),
          if (_isAboutExpanded) ...[
            const Divider(height: 1.0, thickness: 1.0, color: Colors.black12),
            Container(
              padding: const EdgeInsets.all(16.0),
              color: const Color(0xFFFAFAFA),
              child: const Text(
                'Rohingya Young Generation Network (RYGN) is a youth-led community organization established to support Rohingya youth through education, human rights advocacy, emergency relief, and capacity building.',
                style: TextStyle(
                  fontSize: 14.0,
                  height: 1.5,
                  color: textGrey,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // --- 6. CONTENT PARAGRAPH (Text grey #4A4A4A) ---
  Widget _buildContentParagraph() {
    return const Text(
      'Over the last three decades, Rohingya Young Generation Network has contributed to empowering youth through education, leadership and humanitarian support across community networks worldwide.',
      style: TextStyle(
        fontSize: 16.0,
        height: 1.6,
        color: textGrey,
        fontWeight: FontWeight.normal,
      ),
    );
  }

  // --- 7. POLICIES AND REPORTS SECTION ---
  Widget _buildPoliciesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Our Policies and Reports',
          style: TextStyle(
            fontSize: 28.0,
            fontWeight: FontWeight.w900,
            color: contentBlack,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 12.0),
        const Divider(color: Color(0xFFCCCCCC), thickness: 1.0),
        const SizedBox(height: 16.0),

        // Activity Report Row
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Column: Stacked Text Title
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Rohingya /\nYoung /\nGeneration /\nNetwork /\nActivity /\nReport /\n2025 /\n(including /\nIncome & /\nExpenses)',
                    style: TextStyle(
                      fontSize: 17.0,
                      fontWeight: FontWeight.w900,
                      color: contentBlack,
                      height: 1.25,
                    ),
                  ),
                  SizedBox(height: 8.0),
                  Text(
                    'pdf - 1 MB',
                    style: TextStyle(
                      fontSize: 12.0,
                      color: Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),

            // Right Column: #FFD600 Download Circle Button + View PDF text
            Column(
              children: [
                GestureDetector(
                  onTap: _openReportPdf,
                  child: Container(
                    width: 52.0,
                    height: 52.0,
                    decoration: const BoxDecoration(
                      color: yellowPrimary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.south_rounded, // Black download arrow
                      color: contentBlack,
                      size: 26.0,
                    ),
                  ),
                ),
                const SizedBox(height: 6.0),
                GestureDetector(
                  onTap: _openReportPdf,
                  child: const Text(
                    'View PDF',
                    style: TextStyle(
                      fontSize: 13.0,
                      fontWeight: FontWeight.w900,
                      color: contentBlack,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  // Country Selector Modal Bottom Sheet (Comprehensive Supported Countries List)
  void _showCountryPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16.0)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          maxChildSize: 0.85,
          builder: (context, scrollController) {
            return Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12.0),
                  child: Container(
                    width: 36.0,
                    height: 4.0,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2.0),
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Text(
                    'Select Country Website / Regional Portal',
                    style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.bold),
                  ),
                ),
                const Divider(height: 1.0),
                Expanded(
                  child: ListView.builder(
                    controller: scrollController,
                    itemCount: _supportedCountries.length,
                    itemBuilder: (context, index) {
                      final country = _supportedCountries[index];
                      final isSelected = country == _selectedCountry;
                      return ListTile(
                        title: Text(
                          country,
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.w900 : FontWeight.normal,
                            color: isSelected ? contentBlack : Colors.black80,
                          ),
                        ),
                        trailing: isSelected ? const Icon(Icons.check_circle, color: yellowPrimary) : null,
                        onTap: () {
                          setState(() => _selectedCountry = country);
                          Navigator.pop(context);
                        },
                      );
                    },
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
`;
