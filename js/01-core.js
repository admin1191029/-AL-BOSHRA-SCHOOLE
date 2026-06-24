// ══════════════════════════════════════════════
// CONSTANTS — Dynamic (overridden by saved state)
// ══════════════════════════════════════════════
const DEFAULT_SUBJECTS = [
  {
    id:'sub_arabic', name:'لغتي', icon:'📖', color:'#1565c0',
    sections:[
      { id:'sec_r', name:'القراءة', icon:'📖', skills:[
        'التعرف على الحروف','الحروف بحركة الفتح','الحروف بحركة الكسر',
        'الحروف بحركة الضم','سرعة الأداء في الحروف','قراءة كلمات ثلاثية',
        'المد بالألف والواو والياء','السكون','اللام القمرية',
        'الشدة','اللام الشمسية','التنوين'
      ]},
      { id:'sec_w', name:'الكتابة', icon:'✍️', skills:[
        'التعرف على الحروف','الحروف بحركة الفتح','الحروف بحركة الكسر والضم',
        'سرعة الأداء في الحروف','كتابة كلمات ثلاثية','المد بالألف والواو والياء',
        'السكون','اللام القمرية','الشدة','اللام الشمسية','التنوين','التاء المربوطة'
      ]}
    ]
  }
];

// Legacy helpers — point to first subject's sections
function READ_SKILLS(){ return (S.subjects[0]?.sections[0]?.skills)||[]; }
function WRITE_SKILLS(){ return (S.subjects[0]?.sections[1]?.skills)||[]; }


const SCHOOL_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhAQEBAQFQ8VFRYWEBYYEBcVFxUVFhUYFxgVFRgaHiohGBolIRcYITIhJikrLjouHSAzODMtNygtLi4BCgoKDg0OGxAQGzclICU3LTYtLTM1NTIxLSsvNy8tNy8rLS0tLS8tLS4vLS0tLS0tLS0tNy0rLTUtLS0tLy0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQYEBQcDAv/EAEcQAAIBAwIDBQQGBggFBAMAAAECAwAEERIhBQYxEyJBUWEHMnGBFCM0QpGhUmJysbLBM0NTc4OSs9EVJHSC8ERjouEWFyX/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAwQFAgEG/8QAMhEAAgIBAwIDBgQHAQAAAAAAAAECAxEEEiExQRMiUQUyYXGB0RQjQvEVMzSRocHw4f/aAAwDAQACEQMRAD8A7jSlKAUpUZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaZoCaVGaUBNKUoBSlKAUpSgFKUoCDUVJqKAmoqajNASaVq+Ccehu1YwltSYEqOhSSMkZAdG3Ukb/Otk7gAknAG5PgAPE0Bpm48RxAWDQSYa37eOUYKnS5SRWHUYzHj9rw2zn23FIZEaWOaJ4lLKzrIrKCvvAkHAIrmntc43LFc2kUNncTSPHIpMZbEsEjIZIBoBYEmJM430scEFsip8J5W483bta28FhbzSRytD3FTVEQyaUfW6bqCRsDnBGNgB3O74zBEk0kkqhIUMkxznQoLrkgesbjHXKkVprjjErtYXNtc2wsbgxAJJC/aydpqb6tgww2kDuldgGJ6Vz/AIhwG/tOGX8l9fWq3byW7o5bKlIJWmCY7PvOXdiF0nPSsPhfDOYYBw1Wt4JYraUfR1bRhA8RjzKUIYKolYZO4K53A3A7pSua+yu0u4m4jecU+rlkkSEs7t3jE8uXGtiAhMoVQuF7uw3rpWaAVIqKUApSlAKmopQCpNRSgFSKilAKUpQClKUApSlASKVFTQE0pSgFKUoBSlKAUpSgINRUmooCTVd47zDGouIbe4gF7C0IKSHQheXvxws5GAZFVlBzsSPhVgdwBkkAepxXKvaVzmLSS7tbzh9vPavHGYMuA8rsrEM6n3kVkILLgr3f0hgDx5z5qsYLW1ubV5Le+jkkeG3QAMJGf/mIbtD0QtnVvucFc10uGFLlIZ3STDIjrG4KhSQG78Z++NveGxG2DmqR7OeTQ8dpxHiNuv8AxFUwhOSezGOxeVT/AFyr3QTk4057w2tx5qtBI8LThHRira1ZRkHB7xGn869Sb6Hjkl1Nnd3scIVpZFRSwUFjgFjnAz8jXtmuce0biqytBFE6vGq9oxVgy5clV3G3RX/zV5cnPdzJNbQ3SxxhF95S7JqJH1WCNPQjrgZGBVj8O/C8TJB+I/M2YN/ccTsbm9W3lt4ZHjP1Mzxq+mZTnQhIypGOufeBHXGbbmuH2lozSxwg6XMixg7jSdQXIxvt1q085cUu4+ztZJUwY1LtHlWl8CX/AEASD3R1x1wcCSzSrfGMX1I69S9rlJdDoqsrjYhlOR4EHwI/lVcu+Mx29xHw63CCUxPcSFmPZ28CHSXIz0J2CLgbE5UdcX2b3q/RHQsoWKRh1AAVgHz6DJYfKtHxzgy33ElntOIJDdxxfUSwqZO6pGqOZT3JBlmIOpdm0lWxmq063GTXoWIWKUU/UvHAOP297F2trOkqBirFQRhl6gqd18xnqCDU8Evppu1aWJY1EjLEA4csqsQHLKSpyNJ26HUp93J5ZdcgXXD7qWW0unWwuYZFvm0AyBm20QwpjVIxb6vSNjkHb3rxyLassZkkk0RIBFb2yuDHaxRgLodxtLPt32JODlRjfMZIW6lfMcgYBlIKkZUg5BB6EEdRX1QClKUApSlAKVGN85PTptj4+dTQClKUApWj5i5g+jRTypE0pgaHtkUjVpkddQQfecI2oLtnIGaq95zbcXNnI0Nu8Jne4t4Q+Umz9DaRJEQ9SJAVPoM0B0Slcy4jz3MbkpbWN88iR3FvpMGI2uBIhikDFgCumOU9R4Dxq8cq3E0lnayXIYXDRI0oZNDaiu5Zfuk9dPhnFAbWpqKmgJpSlAKUpQClKUApSlAQaipNKA03NvBlvLZ7dgCC0bhSdnMUiyBG/VbRpPoTVRS8+nzSQ33Co1uIklm4ZHIytL2aMsJaXcqmXKkbkbE76QzdAvLYSLpbPgVIOCrDoynwIqg8O5XkF7JOvE2uLgyoLpzpjkito8ukEaoughnAD7KCAcAHNMnqTZbeXLI2dna280ys0MSRs5OkHSMbZ8B0HoK5pzNGWuLqZAWg7XHaLumplBxqG2d//M1HN3DBBdSqQNLHtIyd+65Jxk+RDD4AVsOXeaFij+i3MKvanI2UZAYktqXo43Pr+0a0qapVrxIebPYzrbFY9k+MGbyjNDcW03DnVUkYMyNj3z1DnzdCF+QHkca3ky5a3vkRxpLFoZBno2dvj31A+dfd3y84kim4exlhdx2Lq2TE430yE9APM/Bhn3rfecGtYm+n3pRZFEbStrKxCRQBrUeOSBgHPQbZrmdkI7kuVLt3TPYQnLD7x7+qKXwuH/8Apqnldy/gskjD+GvTjCm+4k8aE6S/ZAj7qRbO34hyPiPOvS99ovDElM1tYtLNqOmfsI4VMjZHelfDLkE5JHTNWLk2+tLkzTwQCC/UFLiJusbE5zpBAZWIB1DGcb71472vPjtj6nqpWNue+TUe0GeBRFaRRprTSzkD3AF0qnqSPPOBjzBHz7PbVkuDLIrIhgOhmGlWDuuCpOxzoP76++GcsFJJbnibKI0YlssCJmznWf1MnZcAk7YAGDr+buZRd6YkQCBXypZe+7YKggfdG526nPhuK7j5oeFDld2cy4l4kvojpt7Ak0ckRY6ZEZCVfDAMCCVYbg79RXE+ULbsLqfgPEbpTYWmq60suhJsBJNEjM39CNXaaOhOc7bG0+zjgoad7hkAEOUXu4PasMMD4gqpOQf0h5VpvbXDEt1w+7VIpXgmiS8h7JXZkkJaIPtkhhHKoB8xjrVG2ChLankuVTc45awdF5bv5ZpLmQOstg/ZvZSgKowV0vEoA1MAV1a2668D3asFaLl/jUk/aM9s1vb6tNqZG0SzKBu5hKgxL0wCckdQNq3tRkgpU0oCKUrQc6300Nvrt86tQDsFyUTBy2PiAM+tdRjuaRzKW1Ns39Kr/JN/NNb67jJbUQjFQC6YHewPXIz6VYBSUdraYhLcsilTSuTor93yfZyXa38kOq6XQQ3aPp1R+45TOksvgSPXqKqXHeOR/SzcW0MfborRidtTEgkatC50jOMasZI9K6LxA4ilI6hHx/lNcs5OgV7uBXUMveOCMjIRiNviBVbUTkmox4yafs+muUZ22LO1dDccH53k1qtyEMZOCwXSV9SOhFdBWuX89W6JdEIoUFFYgDAydQJx8hXQeXnJtbYnqYo8/wCUUonLc4SecHuvpr8OF1axu7GwqaipqyZZNKUoBSlKAUpSgFKUoCDUVJqKAxOLXfYwyy/oISPjjYfjiqLy5xNbO2kupFd5JpdC4HvFRnvMdl3LHz64BxVk58fFnJ6sg/8AmD/KvLlGzSXh6RyKGR+0DA+P1jfn03qFNO9J9Ei7tcdFJx6tpf25Knb83sbkXM8Ssqo6RouBoDlSSCRljhcbkemN6X11wy4ywjntZPNY1KE+qISPwAPrTh3DLAzXUc139VGUELGRU1Z16gCffIwBkeh8a9bmy4Sv/qrkn9VS359litn8pPMFJfIwcWNeZr6mXbcRt+D24kkYzTXTAwJGpDSrgaNKt0ADZJPi2N9hVY5m4lPxGS3N5bfR7KIsxj7cOXYjCs+MaQOmfDUckZzWrueLE3s11Kn1MQW3hByXtYQAIZXTGdEgbOoeLEeIB3LHoQc5AIbrkHyx1G+3oceQGJrtTbXPCXX9X29MGvo6K5xznp2+/wAyJ4wV7IovZ4x2YXCY/Rx/PwI/CuzxT2Tpc2rtiL3G3LRp/ZyD+tg8N919Mb7csYhkgtbjqQCTB+A70X7h5rkDxnuEk7ZnuewsYiI5ZUw01xKVB7KDy2O5+GcjcV9A7o2Yhyn19P3/AO6E+s8JwzLhrp6/sXS241b8YszrkW3ngxJMD3uzwDqcbjVGVLYPhneviz4xw+y3t45Z5unasuD/AJnxpB/VWsLl7lZnMd7cxfQ7OC3ljhh3M7wujBmuX+DMwTGxPQY3y7eHgwxmSZj+sJx+SqBW7DbzHlr0RjT3ZT4T9WYEXOlwkskq6BE7ajE3eVdhnDgA52zk7eldDspZLm3Dsr20rrtjQzp5MNakZxuNS+O4qm2j8MF9EUz2ehezJz2Pba23bX3teNOCe708cVZOceNm2i0xn66TIQ/oge83y8PU1Dq51xSajgn0VVlk9ilnJWuIizspdao13xAdZ7hzM0Z/VJ2Q7+7GFHw6VjJd8Ru942mK/qHskHpqyM/ia9+T+W/pB7ebPYgnSD/WNnck/o5/E/nbON8xQ2gCEapMd2NcDA8M+Cj/AMxWX5rFum8I3/y6JeFTDfPu2VePlniPUTlT/wBU+fyra8BTiKTolxloN9ZLI3gcYYd7OcdawV9oLZ3tl0+kpz/DvVq4JxyK6UtGSGHvKdmXPT4j1FdVqtvyyZxqpamMH4tax64XH1Rs6onDea7h77sGRezMjIU095Aue9nzGMnwqz8x8Y+iwmXTqJIVRnAJOep8sA1g8A48k8U1w0QR4we0xgkqF1bHGfA7VchdCLcWsvBlS0ts4KyPupml5w49dw3Sxw5VMKYx2YbtSeo3GTvtgfzq9QsSoLDBwMjyPiKq/LnNv0mYwtDoyCyEPq6eB28vGvObnQLcmDsfqxJ2ZbV3s6tJOnHTPhXEtTXKEccdvmSR9n6iNkotc9ceiLeailK6ITH4j/RTf3b/AMJrmXI32yD4P/ptXTeI/wBFN/dv/Ca5lyN9sg+D/wCm1VNR/Mga/s/+mu+X+mZHtC+1/wCEn72q98tfZLX+5j/hFUX2hfa/8JP3tV65a+yWv9zH/CKU/wA6Q1n9HUbMUqKmrZkE0pSgFKUoBSlKAUpSgINRUmlAV/nmLVZy4+6Ub8HGar/BYZrjhzQW0io6yMHzkakYaigYe7kt1wdgR45q78QtRLHJE3R1Kn5jFULkO8MNxJbSbF8jHlJGTt+Gr8BUDlsujI0Ko+Lo7K+6af06Ggt+Xrhp1tjH2cpBI1kqpA66WUEN8s/Ktjfcv29r9rumeXqIYUUN/wBzNnA9SF9Kyef+MMblI4nZewGdSnBEjjff0Ugf9zCsDljlp7smWRtFuGOt85d2+8Bnp6sfz8N3fNwU5ywvgfN7IqThFZfxM4cGj4jbJLaKsF/agxIWPaK8YG0ExI+sjZTjcbEnbHWl2cjwGRBBN2aMRcWoy01pIfGPxkgbOx/W6+LXW55lZZYbfhiKIUYKihc9ux2OSd9J66s5+8Tis7maygu7lBBcrb8XhIVH0Eq4KhmhboJVwTt1Bzt1FUrqlJbbFw+V6ouVW7XmL5XHzKNdWAYI19HJNeTfYeHxuy9nnOGcrgg9SWPr5HTduQPZzHZ6Li50yXfVR1jgJxns89X2Hf8ATbzO35R5aitC8jyie/k+0TnGo+aKPuINu76DyGM9+YY5Em+hslxNGmsIrbP+y2MN8s+HnUaeI7K+Edvl7pvkxuceMwwRiGZGkEwZXRX0t2eMM2cjzA6jr6GqzZ8C4fckC3upY5D0jfTn5Bhlvkxr64VzBFef8vxFIyWP1MoGjBb7meqHwBzv0O+7a7mjlJrVTIriS3JC97AdSTgAjo/xGPhgZq1VDZ5G3GX+GVrJb/Okmv8AKJtuTZpJpoVePs4mCPKQOpRWwIwxOcMNiRtvmvHmKApMLYSPJ2SrGrMcnvd/Hw7+B6ADNRybxwW9yAzjs5cJLlsnOe6/yJ39GJ8KyuEqbq/V8bGUyt6IpyM/go+dUvasrMxrk85Nf2DGEXO9L3Uy/Xcy2dqWA2ijAUebbKo+ZxVH5Z4Mb2WSadmKBsuehdzvpB8ABj8q33tGu9MMcWd3fJ/ZQZP5la23J9p2dpCMd5hrb4vv+7A+VU5RU7Nr6It1zdGldi96bxn4dzKTglsF0C3h0+XZqfz61RuIxf8ADr1Hjz2LDJGfuE4dfXHUfKuk1W+deCNcRK0YzLGSVH6Sn3lHrsD8vWu7q8xzHqiHR34s22Pyy4f3Mf2iNm1jI6dqv8D1quT/ALHxH9hv9Jq0sl3dTolkVZtBGlezIcYBADHwAB8fxqUubm0E9roAMuzZUkkYxlCDg5B9aquzM9+ODVhpnHT+BuWc569soyOQ/tkf7D/w1hXn22T/AKpv9Y16WyXNi8dwYSuQdOpSRhtsNg7H0NeLWdw2q8MT6e01ltJxqLasgddOfHp61FzsUccp5LTw7pWblhrC57nRubuJm3t3ZDiRiEjPkT1I9QATVE+g3qRC81yhNmz2xL4PRiPEVkwRXPE5UMu0K+8wUqijxCZ6sfnXtacbnuLh7F1UQPriMYXBiUAgNnrkYGc7VehTLU7pLhJcGLLUQ0CjW8OUn5u+F6Fm4PxU3Nk8jY7QJIkmP0gvX5gg/OqVyN9sg+D/AOm1SjXlmJbcIwD5BxGWB2xqQ9NxW65H5ekST6TMpQAERqdmJIwWI8Ns9d6gzKyUOOV1Lu2vT1WtSWJe7/31NZ7Qvtf+En72q98tfZLX+5j/AIRVM5/sZDcq6xuytGoUqpbcE5G3juKu/AoGS2t0cYZY0DDyIUZFS1J+LIqauUXo6kmZ4pUVNWjKJpSlAKUpQClKUApSlAQaipNRQE1z7nrhbRSreRZAJGsj7sg91vngfMetdBrxurdZEaN1DIwwwPiKjtr3xwWNLqHRYpdu69UVzglrZXqGdraAzE/XgoCdfiT6HrmqbzRL2Nxd2sB7O3JQSRrgKx7NCcj1zg+YwDkVnXlpPwycSx5aFjgE9GX9CTHRvX5jxFbnhXCrG9kkuSZHlchnieTGg4C4wuCV26kkfuqXR6pKWLeq7HHtDQ+XxKPdff0+DNXybbxwQT8RkKsyBliXUCVI2wfJ3JCj0I/SrF5BgM16Zn3KLJKzf+5IdP563Pyr39ofCY4TA8MapGylHCgKCVOpcgdTu34VPJguoIri5itleNkUrqYoz6Cf6PAOVwzHpucAE+GjKWa5WZ5lx/4ZKWLIwxxExOWpQOK5wO/PdDPoe1YfuFY4lNhxBz9yORgwA/qHw2PXClT8VFa7ht+0c8dwqa3EmoKD7zMSNIOD11EDattztDcduJp4VjDqqoUYupxk4Z9u/vjoMgbZqVxSsUX0awRqWYZXVMzOfuCJGwuoiuiU4dcjdzvrQfeB8cfHxJHzybxB57iK3uW7WERuI0dVYBhhg243YAMMnfHzra8k8FjntS1yglDOwi15JRFCphCd0GVPTHQeVefFbGz4fLHPE0vbrqMcIk1KdSsuXLAsF38/Cqll8IVuuztnDLdOmstsi6117GfzrxNIITbxBVkkGCFAGlOhO3n0Hz8qez/hXZxG4Yd+X3PSMdPxO/wxVb4JwyS/naWYkx6szN0z5Rr/AObD5ZtXOHGxbRdjEQJnXC4+4nQt6eQ/+qx4y3N2y6LofRWVeHBaSrmT5l9ivcVb6fxARKcxKdGf1FOXb5nIHyroyAAYHQbCqTwTg629lcXFxG7FomZkXUH7NQWCLp3DHHh6DwqrcB9p0NtA6TiRJGmjeGPsZiI7RuyWQgsMkR4mGTjUVyAM4qWmLS3PqyprbIuSrh7seF/tnYajUOudv9utcrX2xwhrxJUaN0b/AJVTDKWZATqaUY2IUdpjYaWAzkGtDJ7TY4+ygjeOS0e6umvxLBMX+iXNy7oy7YCmOX1OWUYxmpykdwDDzGf9tjX1iuK23Gra7eReHu8c9vDxJ7VI43hQRTQIY3YEYOXw2D4kHoBXUr/mKC2jZ7hwixwpLOT9xXbQmQN8swYAAblTQG4bHjXyjBtwQRkjY53BII+IIIrlvG/aJb3bFbO4LW8MQuLkdi6MOwvLRwwLAagVEilR51oLT2pwWmVtGhaFr6aScPHOHeGed31xd3TGFUoMHJJB7o8QO3pOh1YZTpOHwR3TgHDeRwQd/MV9hRknAz4nG9cMsfaAoW7gv57Q2t5FK6zxWs0UkrSK8RACqNQUoE1sAe71bci9W8phguhOlxNBDYWUiKXYyOyrMSmoblyyLk+o8NqAvYpiuO8H9qcFpb9lPrEwLvChilA7Ewh4UVmBONREYZvBS22RWxPtrsMZy2e/tok3xLpQg6fvINXoSB54A6hU1yS/9pL21xxC1VHkmUK0EYhkkdHOGnZ8YDRqrFlAI2TBIzmul8u3jz2trPKumWWGKSRcY0s6BmGPDc0BsKmgpQE0pSgFKUoBSlKAUpSgINRUmooCaipqKA8LmNJAY3CsCN1ODkfCqTxbk6SJu2snbbcLqw6/st94eh/Ovfmzgk4mN7bM5bA1BfeXAx3R95fNfj1zUcG55GyXS4I27RRkf9y9Qfhn5VVslCUts1j0Zqaeu6EPEoe5fqj90a08yFtEPEbbtezYMMjQwYAgFkOA3U+Qq02vN9m4/pCh8mRhj5gY/Othi2ul/qpk+TY/mDWquuR7Vt1Eifsvkfg2a9StXR5Rw5aSb88HB/Dp/Zmrs7Swju3uxdQlPejj1DuSN7zfDyHhqPkMbTiXNViUZHPaqRgoIywI+eB+dYf/AOv4v7eb8F/2r2g5Et13d5n+LBR+Qz+ddSs1EuuDmNPs+H6m/hgrs3NbLGtvZx9jEBpTJLvv5E53yfU16cF5SmnbtbgsiE5OreR/x6fE7+lWN7rh9lnQIxIPBfrJPgTuR8yKr3Euabi6bsrZGRT4LkyMPVh7o+H41BNLObHl+heqlJx26aGyPeTN5xjj8Nkn0e2VTKowFG6p6ufE+OOvwrW8r8Ce4k+mXeSCdSBvvnwYjwUeA+Hh1yeXeSwpEt1hm6iPqoPm5+8fTp8augFSxhKbzPp2RUtvrpi4UvLfWX2IArA4lwoTFD2joVILaNHfUEEo+pTlTjBAxsTWwpVkzTWcR4KkveVmikJGqSNYw7gKyhWLI2Vwx2rN+iR/2cfke4Onl+Qr2pQHktugOQig4xkKAceWfLaqzzPyibm5huobi5hlCrFMYrkw64A5bBGhtRGp8e7169MWulAa3hvA4YAFiTCiJIQpZmXQhJHdJxqOo5bqdsk4rL+hRf2Uf+Rf9q96UB4GyiOAYoyAMDKA4HkPIV7BRU0oDya3QnJRSfMqCdum9fLWUf8AZx/5F/29BXvSgNTwzgSxTTXDSzTTS6RqkKdxE1aY4wiqFXvE9MnxJrbAUpQCpqKmgJpSlAKUpQClKUApSlAQaipNRQEmsTid+lvFLcStpiiRnkOCcKoyTgbnp0rIlkCjLMAOm5A3+dca4/ecVupL6LhsUd9w43KsHfs2QPGiF7cK7hZIg2PAjI6k5oDqsXG4ZDEsLpI0sLzw4bZ41KLqz4AmRfz8qqHGbu3ZrePiNq9vdy20s8jxnWsfYjVIrOvdbC5OTt0GdxnV+zrhz2yRXV0n0O2SG9CRyy9+COR7RhntADgvHO+421AeNY3K1vxK+TF3CGtBw67gtbokCS6S47IRl1LkqWVAckD13O/koqSwzuFkoPMXhm9fkiUYktp1OQCucxtg7jvLn+VP+H8WTZXkYekyN/GavdjEUjjRt2VFU/EKAa9qh/Dx7ZRc/iNr99KXzRz36LxdtiZh/ixD9xqP/wATvpf6aYY8dUzv+XT866HSvPw8e7b+p7/EZr3YxXyRTrDkGJcGaR39FGhf5n8xVoseHxQrpijVF9B1+J6n51k0qWFcYdEVrdTbb78sipqKV2QClKUAqailAKmopQE0FRSgJqKUoBU1FKAUpSgJFKipoCaUpQClKUApSlAKUpQEGoqTUUB5XdrHKjRyxo8bDDqyhlYeRB2NefDuHxW8aw28SRxLnSiKFUZJJwB5kk/OsqooDB4vwa3ukEd1BFMgOQHQNg+Yz0PhtWaigAAAADYAdAB4CpqaAilKUApSlAKUpQClKUApSlAKUpQClKUApSlAKUpQCpqKUApSlAKmoqRQE0pSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgFKUoBSlKAUpSgP//Z";
const AVATAR_COLORS = [
  ['#1565c0','#42a5f5'],['#059669','#34d399'],['#d97706','#fbbf24'],
  ['#7c3aed','#a78bfa'],['#dc2626','#f87171'],['#0e7490','#22d3ee'],
  ['#92400e','#d97706'],['#065f46','#10b981']
];

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
// Active class key — each class has its own localStorage key
let ACTIVE_CLASS_ID = localStorage.getItem('bs_active_class') || 'class_default';

function getClassStorageKey(cid){ return 'bs_class_' + (cid||ACTIVE_CLASS_ID); }
function getAllClasses(){
  try{ return JSON.parse(localStorage.getItem('bs_classes')||'[]'); }catch(e){ return []; }
}
function saveClassMeta(meta){
  const all = getAllClasses();
  const idx = all.findIndex(c=>c.id===meta.id);
  if(idx>=0) all[idx]=meta; else all.push(meta);
  localStorage.setItem('bs_classes', JSON.stringify(all));
}

const S = {
  user: null, teacher: {n1:'',n2:'',n3:'',photo:''},
  students: [], attendance: {}, evals: {}, notes: [],
  subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
  behavior: {}, goals: [], grades: { columns:[], rows:{} },
  planner: {}, meetings: [], seatLayout: [],
  changelog: [],   // [{ id, ts, type, action, detail }]
  resources: [],   // مكتبة الموارد
  /** light | dark | sepia | rose — rose = وردي للمعلمات */
  theme: 'light',
  currentEval: null, currentChart: null, currentSubject: null,
  viewMode: 'table',
  qeQueue: [], qeIdx: 0, qeSubId:'', qeSecId:'',
  editingPeriod: null,
};


// ══════════════════════════════════════════════
// مكتبة الموارد السحابية
// ══════════════════════════════════════════════

const RES_TYPES = {
  link:    { label:'رابط',        icon:'🔗', color:'badge-blue'  },
  video:   { label:'فيديو',       icon:'🎬', color:'badge-red'   },
  pdf:     { label:'ملف PDF',     icon:'📕', color:'badge-red'   },
  worksheet:{ label:'ورقة عمل',  icon:'📄', color:'badge-gold'  },
  image:   { label:'صورة',        icon:'🖼️', color:'badge-green' },
  other:   { label:'أخرى',        icon:'📦', color:'badge-gray'  },
};

function renderResources() {
  if(!S.resources) S.resources=[];
  const subjects = S.subjects||[];
  const allSubjects = [{id:'all',name:'الكل'},...subjects];

  // فلاتر
  const filterSub  = window._resSub  || 'all';
  const filterType = window._resType || 'all';
  const searchQ    = (window._resSearch||'').trim().toLowerCase();

  let items = [...S.resources].reverse();
  if(filterSub  !== 'all') items = items.filter(r=>r.subId===filterSub);
  if(filterType !== 'all') items = items.filter(r=>r.type===filterType);
  if(searchQ) items = items.filter(r=>
    r.title.toLowerCase().includes(searchQ) ||
    (r.desc||'').toLowerCase().includes(searchQ)
  );

  // إحصاءات
  const total = S.resources.length;
  const byType = {};
  Object.keys(RES_TYPES).forEach(t=>{ byType[t]=(S.resources.filter(r=>r.type===t).length); });

  return `
<div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active"><i class="ti ti-cloud"></i> مكتبة الموارد</span></div>
<div class="ph">
  <div>
    <div class="ph-title"><i class="ti ti-cloud"></i> مكتبة الموارد السحابية</div>
    <div class="ph-sub">${total} مورد مضاف — روابط، فيديوهات، أوراق عمل</div>
  </div>
  <div class="ph-actions">
    <button class="btn btn-primary" onclick="openAddResource()"><i class="ti ti-plus"></i> إضافة مورد</button>
  </div>
</div>

<!-- KPIs -->
<div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr));margin-bottom:16px;">
  <div class="kpi blue"><span class="kpi-icon">📦</span><div class="kpi-val">${total}</div><div class="kpi-label">إجمالي الموارد</div></div>
  <div class="kpi blue"><span class="kpi-icon"><i class="ti ti-link"></i></span><div class="kpi-val">${byType.link||0}</div><div class="kpi-label">روابط</div></div>
  <div class="kpi red"><span class="kpi-icon"><i class="ti ti-movie"></i></span><div class="kpi-val">${byType.video||0}</div><div class="kpi-label">فيديوهات</div></div>
  <div class="kpi gold"><span class="kpi-icon"><i class="ti ti-file-text"></i></span><div class="kpi-val">${byType.worksheet||0}</div><div class="kpi-label">أوراق عمل</div></div>
  <div class="kpi green"><span class="kpi-icon"><i class="ti ti-photo"></i></span><div class="kpi-val">${byType.image||0}</div><div class="kpi-label">صور</div></div>
</div>

<!-- فلاتر -->
<div class="card" style="margin-bottom:16px;">
  <div class="card-body" style="padding:12px 16px;">
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      <!-- بحث -->
      <div class="search-box" style="flex:1;min-width:180px;">
        <span class="search-icon"><i class="ti ti-search"></i></span>
        <input placeholder="بحث في الموارد..." value="${window._resSearch||''}"
          oninput="window._resSearch=this.value;showPage('resources')"
          style="width:100%;border:none;background:none;outline:none;font-family:'Tajawal',sans-serif;font-size:0.88rem;" />
      </div>
      <!-- فلتر المادة -->
      <select onchange="window._resSub=this.value;showPage('resources')"
        style="padding:8px 12px;border:1.5px solid var(--border2);border-radius:var(--r-xs);font-family:'Tajawal',sans-serif;font-size:0.84rem;outline:none;cursor:pointer;">
        ${allSubjects.map(s=>`<option value="${s.id}" ${filterSub===s.id?'selected':''}>${s.name}</option>`).join('')}
      </select>
      <!-- فلتر النوع -->
      <select onchange="window._resType=this.value;showPage('resources')"
        style="padding:8px 12px;border:1.5px solid var(--border2);border-radius:var(--r-xs);font-family:'Tajawal',sans-serif;font-size:0.84rem;outline:none;cursor:pointer;">
        <option value="all" ${filterType==='all'?'selected':''}>كل الأنواع</option>
        ${Object.entries(RES_TYPES).map(([k,v])=>`<option value="${k}" ${filterType===k?'selected':''}>${v.icon} ${v.label}</option>`).join('')}
      </select>
    </div>
  </div>
</div>

<!-- الموارد -->
${items.length===0?`
<div class="empty">
  <div class="empty-emoji"><i class="ti ti-cloud"></i></div>
  <h3>${total===0?'المكتبة فارغة':'لا توجد نتائج'}</h3>
  <p>${total===0?'أضف روابط وفيديوهات وأوراق عمل لتنظيمها هنا':'جرب تغيير الفلتر أو البحث'}</p>
  ${total===0?`<button class="btn btn-primary" style="margin-top:12px;" onclick="openAddResource()"><i class="ti ti-plus"></i> إضافة أول مورد</button>`:''}
</div>`:
`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
  ${items.map(r=>{
    const t = RES_TYPES[r.type]||RES_TYPES.other;
    const sub = S.subjects.find(s=>s.id===r.subId);
    const isYT = r.url && (r.url.includes('youtube.com')||r.url.includes('youtu.be'));
    const ytId = isYT ? (r.url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)||[])[1] : null;
    return `<div class="card" style="transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
      ${ytId?`<div style="width:100%;aspect-ratio:16/9;border-radius:12px 12px 0 0;overflow:hidden;background:#000;">
        <img src="https://img.youtube.com/vi/${ytId}/mqdefault.jpg" style="width:100%;height:100%;object-fit:cover;" />
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:rgba(255,0,0,0.85);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;pointer-events:none;">▶</div>
      </div>`:''}
      <div style="padding:14px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <span class="badge ${t.color}">${t.icon} ${t.label}</span>
            ${sub?`<span class="badge badge-plum">${sub.name}</span>`:''}
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0;">
            <button class="btn btn-xs btn-ghost" onclick="editResource('${r.id}')" title="تعديل"><i class="ti ti-edit"></i></button>
            <button class="btn btn-xs btn-red" onclick="deleteResource('${r.id}')" title="حذف"><i class="ti ti-trash"></i></button>
          </div>
        </div>
        <div style="font-weight:800;font-size:0.95rem;color:var(--ink);margin-bottom:4px;">${r.title}</div>
        ${r.desc?`<div style="font-size:0.82rem;color:var(--muted);margin-bottom:8px;line-height:1.5;">${r.desc}</div>`:''}
        ${r.fileData?`<button onclick="openResourceFile('${r.id}')" 
          style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:linear-gradient(135deg,var(--sky),var(--plum));border:none;color:white;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;font-family:'Tajawal',sans-serif;"
          onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform=''">
          📂 فتح الملف
        </button>
        <button onclick="downloadResourceFile('${r.id}')" 
          style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:var(--surface);border:1.5px solid var(--border2);color:var(--mint);font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;margin-right:6px;font-family:'Tajawal',sans-serif;"
          onmouseenter="this.style.background='rgba(16,185,129,0.08)'" onmouseleave="this.style.background='var(--surface)'">
          ⬇️ تحميل
        </button>
        <div style="font-size:0.72rem;color:var(--muted2);margin-top:6px;">📎 ${r.fileName||'ملف'}</div>`:
        r.url?`<a href="${r.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()"
          style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:var(--surface);border:1.5px solid var(--border2);color:var(--sky);font-size:0.82rem;font-weight:700;text-decoration:none;transition:all 0.15s;"
          onmouseenter="this.style.background='rgba(21,101,192,0.08)'" onmouseleave="this.style.background='var(--surface)'">
          🔗 فتح الرابط
        </a>`:''}
        <div style="font-size:0.72rem;color:var(--muted2);margin-top:8px;">${fmtShort(r.date)}</div>
      </div>
    </div>`;
  }).join('')}
</div>`}
  `;
}

function openAddResource(id) {
  const r = id ? S.resources.find(x=>x.id===id) : null;
  window._editResId = id||null;
  const subjects = S.subjects||[];

  const html = `
<div class="modal-hdr">
  <div><h3>${r?'<i class="ti ti-edit"></i> تعديل مورد':'➕ إضافة مورد جديد'}</h3></div>
  <button class="modal-x" onclick="closeM('mbRes')">✕</button>
</div>
<div class="modal-body">
  <div class="fg">
    <label>العنوان *</label>
    <input type="text" id="resTitle" placeholder="مثال: شرح درس الكسور..." value="${r?r.title:''}" />
  </div>
  <div class="form-row">
    <div class="fg">
      <label>النوع</label>
      <select id="resType">
        ${Object.entries(RES_TYPES).map(([k,v])=>`<option value="${k}" ${r&&r.type===k?'selected':''}>${v.icon} ${v.label}</option>`).join('')}
      </select>
    </div>
    <div class="fg">
      <label>المادة</label>
      <select id="resSub">
        <option value="">— عام —</option>
        ${subjects.map(s=>`<option value="${s.id}" ${r&&r.subId===s.id?'selected':''}>${s.name}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="fg">
    <label>طريقة الإضافة</label>
    <div style="display:flex;gap:10px;margin-bottom:12px;">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;background:${r&&r.fileData?'rgba(21,101,192,0.08)':'rgba(21,101,192,0.15)'};border:1.5px solid ${r&&r.fileData?'var(--border)':'var(--sky)'};border-radius:10px;">
        <input type="radio" name="resSourceType" value="url" ${r&&r.fileData?'':'checked'} onchange="toggleResSourceType('url')"> رابط خارجي
      </label>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;background:${r&&r.fileData?'rgba(21,101,192,0.15)':'rgba(21,101,192,0.08)'};border:1.5px solid ${r&&r.fileData?'var(--sky)':'var(--border)'};border-radius:10px;">
        <input type="radio" name="resSourceType" value="file" ${r&&r.fileData?'checked':''} onchange="toggleResSourceType('file')"> رفع ملف
      </label>
    </div>
  </div>
  <div class="fg" id="resUrlGroup" style="display:${r&&r.fileData?'none':'block'};">
    <label>الرابط (URL)</label>
    <input type="url" id="resUrl" placeholder="https://..." value="${r&&!r.fileData?r.url:''}" dir="ltr" />
  </div>
  <div class="fg" id="resFileGroup" style="display:${r&&r.fileData?'block':'none'};">
    <label>اختر ملف (PDF / فيديو / صورة)</label>
    <input type="file" id="resFile" accept=".pdf,video/*,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onchange="handleResFileSelect(this)" style="padding:10px;background:rgba(21,101,192,0.06);border:1.5px dashed var(--border2);border-radius:10px;width:100%;" />
    <div id="resFileInfo" style="margin-top:8px;font-size:0.82rem;color:var(--muted);display:${r&&r.fileData?'block':'none'};">${r&&r.fileData?'📎 ملف محمّل: '+r.fileName:''}</div>
    <div id="resFileProgress" style="display:none;margin-top:8px;">
      <div style="background:var(--border);border-radius:8px;height:6px;overflow:hidden;">
        <div id="resProgressBar" style="background:linear-gradient(90deg,var(--sky),var(--mint));height:100%;width:0%;transition:width 0.3s;"></div>
      </div>
      <div id="resProgressText" style="font-size:0.75rem;color:var(--muted);margin-top:4px;text-align:center;">جاري التحميل...</div>
    </div>
  </div>
  <div class="fg">
    <label>وصف مختصر (اختياري)</label>
    <textarea id="resDesc" placeholder="وصف قصير للمورد..." rows="2">${r?r.desc:''}</textarea>
  </div>
</div>
<div class="modal-footer">
  <button class="btn btn-ghost" onclick="closeM('mbRes')">إلغاء</button>
  <button class="btn btn-primary" onclick="saveResource()"><i class="ti ti-circle-check"></i> ${r?'حفظ التعديل':'إضافة المورد'}</button>
</div>`;

  let mb = document.getElementById('mbRes');
  if(!mb){
    mb = document.createElement('div');
    mb.className='modal-bg';
    mb.id='mbRes';
    const m = document.createElement('div');
    m.className='modal sm';
    m.id='mRes';
    mb.appendChild(m);
    document.body.appendChild(mb);
  }
  document.getElementById('mRes').innerHTML = html;
  openM('mbRes');
}

function editResource(id){ openAddResource(id); }

// متغير لحفظ بيانات الملف المرفوع
window._uploadedResFile = null;

function toggleResSourceType(type) {
  const urlGroup = document.getElementById('resUrlGroup');
  const fileGroup = document.getElementById('resFileGroup');
  const urlRadio = document.querySelector('input[name="resSourceType"][value="url"]');
  const fileRadio = document.querySelector('input[name="resSourceType"][value="file"]');
  
  if(type === 'url') {
    urlGroup.style.display = 'block';
    fileGroup.style.display = 'none';
    urlRadio.parentElement.style.background = 'rgba(21,101,192,0.15)';
    urlRadio.parentElement.style.borderColor = 'var(--sky)';
    fileRadio.parentElement.style.background = 'rgba(21,101,192,0.08)';
    fileRadio.parentElement.style.borderColor = 'var(--border)';
  } else {
    urlGroup.style.display = 'none';
    fileGroup.style.display = 'block';
    fileRadio.parentElement.style.background = 'rgba(21,101,192,0.15)';
    fileRadio.parentElement.style.borderColor = 'var(--sky)';
    urlRadio.parentElement.style.background = 'rgba(21,101,192,0.08)';
    urlRadio.parentElement.style.borderColor = 'var(--border)';
  }
}

function handleResFileSelect(input) {
  const file = input.files[0];
  if(!file) return;
  
  // التحقق من حجم الملف (الحد الأقصى 10MB للتخزين المحلي)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if(file.size > maxSize) {
    toast('حجم الملف كبير جداً! الحد الأقصى 10 ميجابايت', 'error');
    input.value = '';
    return;
  }
  
  const progressDiv = document.getElementById('resFileProgress');
  const progressBar = document.getElementById('resProgressBar');
  const progressText = document.getElementById('resProgressText');
  const fileInfo = document.getElementById('resFileInfo');
  
  progressDiv.style.display = 'block';
  progressBar.style.width = '0%';
  progressText.textContent = 'جاري قراءة الملف...';
  
  const reader = new FileReader();
  
  reader.onprogress = function(e) {
    if(e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percent + '%';
      progressText.textContent = 'جاري التحميل... ' + percent + '%';
    }
  };
  
  reader.onload = function(e) {
    progressBar.style.width = '100%';
    progressText.textContent = 'تم التحميل بنجاح ✅';
    
    // تحديد نوع الملف
    let fileType = 'other';
    const ext = file.name.split('.').pop().toLowerCase();
    if(ext === 'pdf') fileType = 'pdf';
    else if(['mp4','webm','mov','avi','mkv','m4v'].includes(ext)) fileType = 'video';
    else if(['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext)) fileType = 'image';
    else if(['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) fileType = 'worksheet';
    
    // حفظ بيانات الملف
    window._uploadedResFile = {
      data: e.target.result,
      name: file.name,
      type: file.type,
      size: file.size,
      fileType: fileType
    };
    
    // تحديث نوع المورد تلقائياً
    const typeSelect = document.getElementById('resType');
    if(typeSelect) typeSelect.value = fileType;
    
    // إظهار معلومات الملف
    const sizeKB = Math.round(file.size / 1024);
    const sizeText = sizeKB > 1024 ? (sizeKB/1024).toFixed(1) + ' MB' : sizeKB + ' KB';
    fileInfo.innerHTML = '📎 ' + file.name + ' <span style="color:var(--muted2);">(' + sizeText + ')</span>';
    fileInfo.style.display = 'block';
    
    setTimeout(() => {
      progressDiv.style.display = 'none';
    }, 1500);
  };
  
  reader.onerror = function() {
    progressText.textContent = 'حدث خطأ في قراءة الملف!';
    progressBar.style.background = 'var(--ember)';
    toast('فشل في قراءة الملف', 'error');
  };
  
  reader.readAsDataURL(file);
}

function saveResource(){
  const title = document.getElementById('resTitle').value.trim();
  if(!title){ toast('اكتب عنواناً للمورد','error'); return; }
  
  // التحقق من نوع المصدر (رابط أو ملف)
  const sourceType = document.querySelector('input[name="resSourceType"]:checked')?.value || 'url';
  const urlValue = document.getElementById('resUrl').value.trim();
  
  // لو اختار ملف ولا يوجد ملف مرفوع ولا ملف سابق
  const existingRes = window._editResId ? S.resources.find(r=>r.id===window._editResId) : null;
  if(sourceType === 'file' && !window._uploadedResFile && !(existingRes && existingRes.fileData)) {
    toast('الرجاء اختيار ملف للرفع', 'error');
    return;
  }
  
  const obj = {
    id: window._editResId || genId(),
    title,
    type:  document.getElementById('resType').value,
    subId: document.getElementById('resSub').value,
    url:   sourceType === 'url' ? urlValue : '',
    desc:  document.getElementById('resDesc').value.trim(),
    date:  window._editResId ? (S.resources.find(r=>r.id===window._editResId)?.date||today()) : today(),
  };
  
  // إضافة بيانات الملف إذا كان مرفوعاً
  if(sourceType === 'file') {
    if(window._uploadedResFile) {
      obj.fileData = window._uploadedResFile.data;
      obj.fileName = window._uploadedResFile.name;
      obj.fileType = window._uploadedResFile.type;
      obj.fileSize = window._uploadedResFile.size;
    } else if(existingRes && existingRes.fileData) {
      // الاحتفاظ بالملف القديم إذا لم يتم رفع ملف جديد
      obj.fileData = existingRes.fileData;
      obj.fileName = existingRes.fileName;
      obj.fileType = existingRes.fileType;
      obj.fileSize = existingRes.fileSize;
    }
  }
  
  // مسح الملف المرفوع بعد الحفظ
  window._uploadedResFile = null;
  
  if(window._editResId){
    const idx = S.resources.findIndex(r=>r.id===window._editResId);
    if(idx>=0) S.resources[idx]=obj;
  } else {
    if(!S.resources) S.resources=[];
    S.resources.push(obj);
  }
  save();
  // تحديث badge
  const nb = document.getElementById('nb-resources');
  if(nb){ nb.textContent=S.resources.length; nb.style.display=S.resources.length>0?'flex':'none'; }
  closeM('mbRes');
  toast(window._editResId?'تم تعديل المورد ✅':'تمت إضافة المورد ☁️','success');
  showPage('resources');
}

function deleteResource(id){
  if(!confirm('حذف هذا المورد؟')) return;
  S.resources = S.resources.filter(r=>r.id!==id);
  save();
  const nb = document.getElementById('nb-resources');
  if(nb){ nb.textContent=S.resources.length; nb.style.display=S.resources.length>0?'flex':'none'; }
  showPage('resources');
  toast('تم الحذف','success');
}

// فتح ملف المورد في نافذة جديدة
function openResourceFile(id) {
  const r = S.resources.find(x=>x.id===id);
  if(!r || !r.fileData) {
    toast('لا يوجد ملف مرفق', 'error');
    return;
  }
  
  // فتح الملف في تبويب جديد
  const win = window.open('', '_blank');
  if(!win) {
    toast('تم حظر النافذة المنبثقة، يرجى السماح بها', 'error');
    return;
  }
  
  const ext = (r.fileName||'').split('.').pop().toLowerCase();
  
  // إذا كان PDF
  if(ext === 'pdf' || r.fileType?.includes('pdf')) {
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${r.title} - ${r.fileName}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#1e3a5f; font-family:'Tajawal',sans-serif; }
          .header { background:#0d1b2a; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; }
          .title { color:white; font-size:1rem; font-weight:700; }
          .actions { display:flex; gap:8px; }
          .btn { padding:8px 16px; border-radius:8px; border:none; font-family:'Tajawal',sans-serif; font-weight:700; cursor:pointer; font-size:0.85rem; }
          .btn-dl { background:#10b981; color:white; }
          .btn-close { background:#ef4444; color:white; }
          iframe, embed { width:100%; height:calc(100vh - 52px); border:none; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">📕 ${r.title}</div>
          <div class="actions">
            <button class="btn btn-dl" onclick="downloadFile()"><i class="ti ti-download"></i> تحميل</button>
            <button class="btn btn-close" onclick="window.close()">✕ إغلاق</button>
          </div>
        </div>
        <embed src="${r.fileData}" type="application/pdf" />
        <script>
          function downloadFile() {
            const a = document.createElement('a');
            a.href = '${r.fileData}';
            a.download = '${r.fileName}';
            a.click();
          }
        <\/script>
      </body>
      </html>
    `);
  }
  // إذا كان فيديو
  else if(['mp4','webm','mov','avi','mkv','m4v'].includes(ext) || r.fileType?.includes('video')) {
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${r.title} - ${r.fileName}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#0d1b2a; font-family:'Tajawal',sans-serif; display:flex; flex-direction:column; min-height:100vh; }
          .header { background:#1e3a5f; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; }
          .title { color:white; font-size:1rem; font-weight:700; }
          .actions { display:flex; gap:8px; }
          .btn { padding:8px 16px; border-radius:8px; border:none; font-family:'Tajawal',sans-serif; font-weight:700; cursor:pointer; font-size:0.85rem; }
          .btn-dl { background:#10b981; color:white; }
          .btn-close { background:#ef4444; color:white; }
          .video-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:20px; }
          video { max-width:100%; max-height:calc(100vh - 100px); border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title"><i class="ti ti-movie"></i> ${r.title}</div>
          <div class="actions">
            <button class="btn btn-dl" onclick="downloadFile()"><i class="ti ti-download"></i> تحميل</button>
            <button class="btn btn-close" onclick="window.close()">✕ إغلاق</button>
          </div>
        </div>
        <div class="video-wrap">
          <video controls autoplay>
            <source src="${r.fileData}" type="${r.fileType||'video/mp4'}">
            المتصفح لا يدعم تشغيل الفيديو
          </video>
        </div>
        <script>
          function downloadFile() {
            const a = document.createElement('a');
            a.href = '${r.fileData}';
            a.download = '${r.fileName}';
            a.click();
          }
        <\/script>
      </body>
      </html>
    `);
  }
  // إذا كان صورة
  else if(['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext) || r.fileType?.includes('image')) {
    win.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${r.title} - ${r.fileName}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#1e3a5f; font-family:'Tajawal',sans-serif; display:flex; flex-direction:column; min-height:100vh; }
          .header { background:#0d1b2a; padding:12px 20px; display:flex; align-items:center; justify-content:space-between; }
          .title { color:white; font-size:1rem; font-weight:700; }
          .actions { display:flex; gap:8px; }
          .btn { padding:8px 16px; border-radius:8px; border:none; font-family:'Tajawal',sans-serif; font-weight:700; cursor:pointer; font-size:0.85rem; }
          .btn-dl { background:#10b981; color:white; }
          .btn-close { background:#ef4444; color:white; }
          .img-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:20px; overflow:auto; }
          img { max-width:100%; max-height:calc(100vh - 100px); border-radius:8px; box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title"><i class="ti ti-photo"></i> ${r.title}</div>
          <div class="actions">
            <button class="btn btn-dl" onclick="downloadFile()"><i class="ti ti-download"></i> تحميل</button>
            <button class="btn btn-close" onclick="window.close()">✕ إغلاق</button>
          </div>
        </div>
        <div class="img-wrap">
          <img src="${r.fileData}" alt="${r.title}" />
        </div>
        <script>
          function downloadFile() {
            const a = document.createElement('a');
            a.href = '${r.fileData}';
            a.download = '${r.fileName}';
            a.click();
          }
        <\/script>
      </body>
      </html>
    `);
  }
  // أي نوع آخر - تحميل مباشر
  else {
    downloadResourceFile(id);
    win.close();
  }
}

// تحميل ملف المورد
function downloadResourceFile(id) {
  const r = S.resources.find(x=>x.id===id);
  if(!r || !r.fileData) {
    toast('لا يوجد ملف مرفق', 'error');
    return;
  }
  
  const a = document.createElement('a');
  a.href = r.fileData;
  a.download = r.fileName || 'file';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  toast('جاري تحميل الملف...', 'success');
}

function save() {
  if(S.changelog.length > 200) S.changelog = S.changelog.slice(-200);
  const key = getClassStorageKey();
  localStorage.setItem(key, JSON.stringify({
    user:S.user, teacher:S.teacher,
    students:S.students, attendance:S.attendance,
    evals:S.evals, notes:S.notes, subjects:S.subjects,
    behavior:S.behavior, goals:S.goals, grades:S.grades,
    planner:S.planner, meetings:S.meetings, seatLayout:S.seatLayout,
    changelog:S.changelog, theme:S.theme, darkMode: S.theme === 'dark',
    gamesBank:S.gamesBank||null, _snapshots:S._snapshots||{},
    resources:S.resources||[]
  }));
  if(typeof cloudSyncSave==='function') cloudSyncSave();
}

function load() {
  try {
    const key = getClassStorageKey();
    let raw = localStorage.getItem(key);

    // ── Migration: أول مرة نشتغل بالنظام الجديد ──────────────
    // لو مفيش بيانات في الـ key الجديد، انقلها من bs_v5
    if(!raw || raw === '{}'){
      const oldRaw = localStorage.getItem('bs_v5') || localStorage.getItem('bs_v4') || null;
      if(oldRaw && oldRaw !== '{}'){
        raw = oldRaw;
        // احفظ البيانات القديمة في الـ key الجديد فوراً
        localStorage.setItem(key, oldRaw);
        // ولا تمسح bs_v5 عشان لو في فصل تاني محتاجه
      }
    }

    if(!raw) return;
    const d = JSON.parse(raw);
    if(d.user) S.user=d.user;
    if(d.teacher) S.teacher=d.teacher;
    if(d.students) S.students=d.students;
    if(d.attendance) S.attendance=d.attendance;
    if(d.evals) S.evals=d.evals;
    if(d.notes) S.notes=d.notes;
    if(d.subjects&&d.subjects.length) S.subjects=d.subjects;
    if(d.behavior) S.behavior=d.behavior;
    if(d.goals) S.goals=d.goals;
    if(d.grades) S.grades=d.grades;
    if(d.planner) S.planner=d.planner;
    if(d.meetings) S.meetings=d.meetings;
    if(d.seatLayout) S.seatLayout=d.seatLayout;
    if(d.changelog) S.changelog=d.changelog;
    if(d.gamesBank) S.gamesBank=d.gamesBank;
    if(d.resources) S.resources=d.resources;
    if(d._snapshots) S._snapshots=d._snapshots;
    if(d.theme === 'dark' || d.theme === 'light' || d.theme === 'sepia' || d.theme === 'rose') {
      S.theme = d.theme;
    } else if(d.darkMode) {
      S.theme = 'dark';
    } else {
      S.theme = 'light';
    }
    applyTheme();
  } catch(e) { console.warn('load error',e); }
}


